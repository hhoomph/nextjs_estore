/**
 * Module for component-props
 *
 * Centralized component prop type definitions for consistent typing across React components
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type React from "react";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  "data-testid"?: string;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: ReactNode;
  main?: ReactNode;
}

export interface ContainerProps extends BaseComponentProps {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  centered?: boolean;
}

// Form component props
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
}

export interface InputProps extends FormFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
}

export interface SelectProps extends FormFieldProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  multiple?: boolean;
}

export interface CheckboxProps extends FormFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

export interface RadioProps extends FormFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  value: string;
  name: string;
}

export interface TextareaProps extends FormFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  rows?: number;
  cols?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
  maxLength?: number;
  showCount?: boolean;
}

// Button component props
export interface ButtonProps extends BaseComponentProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

// Modal/Dialog component props
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  footer?: ReactNode | null;
  confirmLoading?: boolean;
}

export interface DrawerProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  placement?: "top" | "right" | "bottom" | "left";
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  footer?: ReactNode;
}

// Table component props
export interface TableProps extends BaseComponentProps {
  data: unknown[];
  columns: TableColumn[];
  loading?: boolean;
  pagination?: PaginationProps;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: unknown[]) => void;
  sortable?: boolean;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  emptyText?: string;
  striped?: boolean;
  bordered?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: unknown, record: unknown, index: number) => ReactNode;
  ellipsis?: boolean;
}

// Pagination component props
export interface PaginationProps extends BaseComponentProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

// Card component props
export interface CardProps extends BaseComponentProps {
  title?: string | ReactNode;
  extra?: ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  cover?: ReactNode;
  actions?: ReactNode[];
  tabList?: Array<{ key: string; tab: string; disabled?: boolean }>;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
}

export interface CardMetaProps extends BaseComponentProps {
  avatar?: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
}

// Badge component props
export interface BadgeProps extends BaseComponentProps {
  count?: number | ReactNode;
  showZero?: boolean;
  overflowCount?: number;
  dot?: boolean;
  status?: "success" | "processing" | "default" | "error" | "warning";
  color?: string;
  text?: string;
  title?: string;
}

// Avatar component props
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | number;
  shape?: "circle" | "square";
  icon?: ReactNode;
  onError?: () => boolean;
  draggable?: boolean;
  crossOrigin?: "anonymous" | "use-credentials";
}

// Alert component props
export interface AlertProps extends BaseComponentProps {
  type?: "success" | "info" | "warning" | "error";
  message: string | ReactNode;
  description?: string | ReactNode;
  closable?: boolean;
  closeText?: string | ReactNode;
  onClose?: () => void;
  afterClose?: () => void;
  showIcon?: boolean;
  banner?: boolean;
}

// Tooltip component props
export interface TooltipProps extends BaseComponentProps {
  title: string | ReactNode;
  placement?:
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    | "leftTop"
    | "leftBottom"
    | "rightTop"
    | "rightBottom";
  trigger?: "hover" | "focus" | "click" | "contextMenu";
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  overlayStyle?: React.CSSProperties;
  overlayClassName?: string;
  destroyTooltipOnHide?: boolean;
}

// Popover component props
export interface PopoverProps extends BaseComponentProps {
  content: string | ReactNode;
  title?: string | ReactNode;
  trigger?: "hover" | "focus" | "click" | "contextMenu";
  placement?:
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    | "leftTop"
    | "leftBottom"
    | "rightTop"
    | "rightBottom";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  overlayStyle?: React.CSSProperties;
  overlayClassName?: string;
}

// Dropdown component props
export interface DropdownProps extends BaseComponentProps {
  menu: DropdownMenuProps;
  trigger?: ("click" | "hover" | "contextMenu")[];
  placement?:
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    | "leftTop"
    | "leftBottom"
    | "rightTop"
    | "rightBottom";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  destroyPopupOnHide?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
}

export interface DropdownMenuProps extends BaseComponentProps {
  items: DropdownMenuItem[];
  onClick?: (item: DropdownMenuItem) => void;
  selectable?: boolean;
  selectedKeys?: string[];
  multiple?: boolean;
  mode?: "vertical" | "horizontal" | "inline";
  theme?: "light" | "dark";
}

export interface DropdownMenuItem {
  key: string;
  label: string | ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: DropdownMenuItem[];
  type?: "divider" | "group";
}

// Navigation component props
export interface NavItem {
  key: string;
  label: string | ReactNode;
  icon?: ReactNode;
  href?: string;
  children?: NavItem[];
  disabled?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
}

export interface NavigationProps extends BaseComponentProps {
  items: NavItem[];
  mode?: "horizontal" | "vertical" | "inline";
  theme?: "light" | "dark";
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onSelect?: (item: NavItem) => void;
  onOpenChange?: (openKeys: string[]) => void;
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

// Breadcrumb component props
export interface BreadcrumbProps extends BaseComponentProps {
  items: Array<{
    title: string | ReactNode;
    href?: string;
    onClick?: () => void;
  }>;
  separator?: string | ReactNode;
  maxCount?: number;
}

// Loading component props
export interface LoadingProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg" | "xl";
  type?: "spinner" | "dots" | "pulse" | "bars";
  color?: string;
  text?: string;
  overlay?: boolean;
  delay?: number;
}

// Progress component props
export interface ProgressProps extends BaseComponentProps {
  type?: "line" | "circle" | "dashboard";
  percent: number;
  showInfo?: boolean;
  status?: "success" | "exception" | "normal" | "active";
  strokeWidth?: number;
  strokeColor?: string | string[];
  trailColor?: string;
  format?: (percent: number) => string | ReactNode;
  size?: "sm" | "md" | "lg";
}

// Notification component props
export interface NotificationProps extends BaseComponentProps {
  type?: "success" | "info" | "warning" | "error";
  title?: string;
  message: string | ReactNode;
  description?: string | ReactNode;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  placement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  key?: string;
}

// Message component props
export interface MessageProps extends BaseComponentProps {
  type?: "success" | "info" | "warning" | "error" | "loading";
  content: string | ReactNode;
  duration?: number;
  onClose?: () => void;
  closable?: boolean;
  key?: string;
}

// Tag component props
export interface TagProps extends BaseComponentProps {
  color?: string;
  closable?: boolean;
  onClose?: () => void;
  visible?: boolean;
  icon?: ReactNode;
  checkable?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

// Switch component props
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  checkedChildren?: string | ReactNode;
  unCheckedChildren?: string | ReactNode;
}

// Slider component props
export interface SliderProps extends BaseComponentProps {
  value?: number;
  defaultValue?: number;
  range?: boolean;
  min?: number;
  max?: number;
  step?: number;
  marks?: Record<number, string | ReactNode>;
  dots?: boolean;
  included?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  onChange?: (value: number | [number, number]) => void;
  onAfterChange?: (value: number | [number, number]) => void;
  tipFormatter?: (value: number) => string | ReactNode;
}

// DatePicker component props
export interface DatePickerProps extends FormFieldProps {
  value?: Date;
  defaultValue?: Date;
  format?: string;
  onChange?: (date: Date | null) => void;
  disabledDate?: (date: Date) => boolean;
  showTime?: boolean;
  showToday?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  bordered?: boolean;
  allowClear?: boolean;
}

// TimePicker component props
export interface TimePickerProps extends FormFieldProps {
  value?: Date;
  defaultValue?: Date;
  format?: string;
  onChange?: (time: Date | null) => void;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  hideDisabledOptions?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  bordered?: boolean;
  allowClear?: boolean;
}

// Upload component props
export interface UploadProps extends BaseComponentProps {
  accept?: string;
  action?: string;
  method?: "POST" | "PUT" | "PATCH";
  directory?: boolean;
  multiple?: boolean;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean>;
  onChange?: (info: UploadChangeParam) => void;
  listType?: "text" | "picture" | "picture-card";
  disabled?: boolean;
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  showUploadList?: boolean | ShowUploadListInterface;
  maxCount?: number;
  onRemove?: (file: UploadFile) => void | boolean | Promise<void | boolean>;
  onPreview?: (file: UploadFile) => void;
  onDownload?: (file: UploadFile) => void;
  previewFile?: (file: File | Blob) => Promise<string>;
  transformFile?: (
    file: File,
  ) => string | Blob | File | Promise<string | Blob | File>;
  iconRender?: (
    file: UploadFile,
    listType?: UploadProps["listType"],
  ) => ReactNode;
  isImageUrl?: (file: UploadFile) => boolean;
  progress?: UploadListProgressProps;
}

export interface UploadFile {
  uid: string;
  name: string;
  status?: "error" | "success" | "done" | "uploading" | "removed";
  response?: unknown;
  linkProps?: any;
  xhr?: any;
  url?: string;
  type?: string;
  size?: number;
  originFileObj?: File;
  percent?: number;
  error?: any;
  thumbUrl?: string;
  preview?: string;
}

export interface UploadChangeParam {
  file: UploadFile;
  fileList: UploadFile[];
  event?: { percent: number };
}

export interface ShowUploadListInterface {
  showPreviewIcon?: boolean;
  showDownloadIcon?: boolean;
  showRemoveIcon?: boolean;
  previewIcon?: ReactNode | ((file: UploadFile) => ReactNode);
  downloadIcon?: ReactNode | ((file: UploadFile) => ReactNode);
  removeIcon?: ReactNode | ((file: UploadFile) => ReactNode);
}

export interface UploadListProgressProps {
  strokeWidth?: number;
  showInfo?: boolean;
  strokeColor?: string;
  size?: "sm" | "md" | "lg";
}

// Utility types for extending HTML elements
export type ComponentWithAs<T extends React.ElementType, P = object> = P &
  Omit<ComponentProps<T>, keyof P> & {
    as?: T;
  };

export type PolymorphicComponent<P = object> = <
  T extends React.ElementType = "div",
>(
  props: ComponentWithAs<T, P>,
) => ReactNode;

// Common HTML attribute extensions
export interface ExtendedHTMLAttributes extends HTMLAttributes<HTMLElement> {
  "data-testid"?: string;
  "data-cy"?: string;
  "data-e2e"?: string;
}

// Theme-aware component props
export interface ThemeProps extends BaseComponentProps {
  theme?: "light" | "dark" | "auto";
  variant?: string;
}

// Responsive props
export interface ResponsiveProps {
  sm?: unknown;
  md?: unknown;
  lg?: unknown;
  xl?: unknown;
  xxl?: unknown;
}

// Animation props
export interface AnimationProps extends BaseComponentProps {
  animation?: string;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number | "infinite";
}

// Accessibility props
export interface A11yProps extends BaseComponentProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-hidden"?: boolean;
  "aria-invalid"?: boolean | "grammar" | "spelling";
  "aria-live"?: "off" | "assertive" | "polite";
  "aria-relevant"?: "additions" | "removals" | "text" | "all";
  "aria-atomic"?: boolean;
  "aria-busy"?: boolean;
  "aria-disabled"?: boolean;
  "aria-readonly"?: boolean;
  "aria-required"?: boolean;
  "aria-selected"?: boolean;
  "aria-checked"?: boolean | "mixed";
  "aria-pressed"?: boolean | "mixed";
  "aria-current"?: boolean | "page" | "step" | "location" | "date" | "time";
  role?: string;
}
