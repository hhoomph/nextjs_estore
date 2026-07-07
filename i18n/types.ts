/**
 * Centralized TypeScript type definitions for next-intl internationalization
 *
 * Provides comprehensive type safety for all message namespaces, locales, and ICU message arguments
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Import from global types defined in global.d.ts

// Supported locales
export type AppLocale = "en" | "fa";

// Locale union type
export type AppLocales = readonly [AppLocale, ...AppLocale[]];

// Message structure types for each namespace
export interface NavigationMessages {
  popular: string;
  products: string;
  shop: string;
  categories: string;
  pages: {
    shopWithoutSidebar: string;
    checkout: string;
    cart: string;
    wishlist: string;
    signIn: string;
    signUp: string;
    error: string;
    mailSuccess: string;
    privacyPolicy: string;
    termsConditions: string;
  };
  blog: {
    grid: string;
    gridWithSidebar: string;
    detailsWithSidebar: string;
    details: string;
  };
  deals: string;
  contact: string;
  search: string;
  account: string;
  orders: string;
  settings: string;
  dashboard: string;
  wishlist: string;
  cart: string;
  profile: string;
  adminPanel: string;
  language: string;
  signOut: string;
}

export interface AuthenticationMessages {
  signIn: string;
  signUp: string;
  signOut: string;
  manageProducts: string;
}

export interface AdminPanelMessages {
  admin: string;
  adminPanel: string;
  analytics: string;
  users: string;
  sales: string;
  revenue: string;
  customers: string;
  totalRevenue: string;
  totalOrders: string;
  totalCustomers: string;
  averageOrderValue: string;
  salesTrend: string;
  userGrowth: string;
  topProducts: string;
  categoryPerformance: string;
  lowStockAlert: string;
  quickActions: string;
  addNewProduct: string;
  manageUsers: string;
  viewAnalytics: string;
}

export interface SettingsMessages {
  generalSettings: string;
  storeSettings: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  defaultCurrency: string;
  lowStockThreshold: string;
  maintenanceMode: string;
  allowRegistration: string;
  saveSettings: string;
  appearance: string;
  theme: string;
  chooseTheme: string;
  languageRegion: string;
  language: string;
  selectLanguage: string;
  currency: string;
  displayCurrency: string;
}

export interface StatusMessages {
  pending: string;
  processing: string;
  shipped: string;
  delivered: string;
  cancelled: string;
  active: string;
  inactive: string;
  inStock: string;
  outOfStock: string;
  lowStock: string;
}

export interface CommonActions {
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;
  view: string;
  back: string;
  next: string;
  previous: string;
  submit: string;
  light: string;
  dark: string;
  system: string;
}

export interface Placeholders {
  enterSiteName: string;
  enterSiteDescription: string;
  enterEmail: string;
  enterName: string;
  enterDescription: string;
  searchProducts: string;
  enterQuantity: string;
}

export interface Currencies {
  irr: string;
  toman: string;
  rial: string;
  usd: string;
  eur: string;
  gbp: string;
  cad: string;
  aud: string;
}

export interface TimePeriods {
  last7Days: string;
  last30Days: string;
  last90Days: string;
  lastYear: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  selectPeriod: string;
}

export interface HomeMessages {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    shopNow: string;
    browseCategories: string;
  };
  featuredProducts: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  product: {
    sale: string;
    viewDetails: string;
  };
  features: {
    title: string;
    subtitle: string;
    freeShipping: {
      title: string;
      description: string;
    };
    securePayment: {
      title: string;
      description: string;
    };
    qualityProducts: {
      title: string;
      description: string;
    };
    support247: {
      title: string;
      description: string;
    };
  };
  categories: {
    title: string;
    subtitle: string;
    electronics: {
      title: string;
      description: string;
      shopButton: string;
    };
    fashion: {
      title: string;
      description: string;
      shopButton: string;
    };
    homeGarden: {
      title: string;
      description: string;
      shopButton: string;
    };
  };
  cta: {
    title: string;
    subtitle: string;
    createAccount: string;
    browseProducts: string;
  };
}

export interface ProductRelatedMessages {
  price: string;
  quantity: string;
  specifications: string;
  relatedProducts: string;
  buyNow: string;
  availability: string;
  brand: string;
  tags: string;
  addToCart: string;
}

export interface CheckoutCartMessages {
  checkout: string;
  proceedToCheckout: string;
  continueShopping: string;
}

export interface CartOperationsMessages {
  cartEmpty: string;
  cartEmptyMessage: string;
  removeFromCart: string;
  updateQuantity: string;
  clearCart: string;
  cartItemCount: string;
  cartTotal: string;
  cartSubtotal: string;
  cartTax: string;
  cartShipping: string;
  cartDiscount: string;
}

export interface CartMessages {
  cartUpdated: string;
  cartCleared: string;
  quantityUpdated: string;
  maxQuantityReached: string;
}

export interface CartSidebarMessages {
  title: string;
  closeButton: string;
  itemsCount: string;
  guestLabel: string;
  syncing: string;
  authenticatedDescription: string;
  guestDescription: string;
  errorMessage: string;
  cartStatus: string;
  emptyTitle: string;
  emptyMessage: string;
  continueShopping: string;
  totalLabel: string;
  totalText: string;
  currency: string;
  totalAmount: string;
  guestCheckoutTitle: string;
  guestCheckoutMessage: string;
  checkoutActions: string;
  proceedToCheckout: string;
  checkoutButton: string;
  viewFullCart: string;
  viewCartButton: string;
}

export interface CheckoutStepsMessages {
  checkoutStep1: string;
  checkoutStep2: string;
  checkoutStep3: string;
  checkoutStep4: string;
  checkoutStep5: string;
}

export interface GuestCheckoutMessages {
  guestCheckout: string;
  guestCheckoutDescription: string;
  continueAsGuest: string;
  signInForAccount: string;
  createAccountOption: string;
  guestOrderNote: string;
}

export interface ShippingInformationMessages {
  shippingInformation: string;
  shippingAddress: string;
  billingAddress: string;
  sameAsShipping: string;
  shippingMethod: string;
  standardShipping: string;
  expressShipping: string;
  freeShipping: string;
  shippingCost: string;
  estimatedDelivery: string;
}

export interface PaymentInformationMessages {
  paymentInformation: string;
  paymentMethod: string;
  creditCard: string;
  debitCard: string;
  paypal: string;
  bankTransfer: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  paymentProcessing: string;
  paymentSuccessful: string;
  paymentFailed: string;
}

export interface OrderReviewMessages {
  orderReview: string;
  orderSummary: string;
  orderItems: string;
  orderTotal: string;
  placeOrder: string;
  confirmOrder: string;
  orderConfirmation: string;
  orderConfirmationSent: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
}

export interface OrderStatusMessages {
  orderPending: string;
  orderProcessing: string;
  orderConfirmed: string;
  orderShipped: string;
  orderDelivered: string;
  orderCancelled: string;
  orderRefunded: string;
}

export interface SEOMessages {
  defaultTitle: string;
  defaultDescription: string;
  siteName: string;
  twitterHandle: string;
  home: {
    title: string;
    description: string;
  };
  category: {
    title: string;
    description: string;
  };
  search: {
    title: string;
    description: string;
  };
  cart: {
    title: string;
    description: string;
  };
  checkout: {
    title: string;
    description: string;
  };
  account: {
    title: string;
    description: string;
  };
}

export interface ContactMessages {
  title: string;
  subtitle: string;
  form: {
    title: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
  };
  info: {
    title: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  faq: {
    title: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
  };
}

export interface BlogMessages {
  title: string;
  readMore: string;
  noPosts: string;
  description: string;
  keywords: string;
  category: string;
  search: string;
  error: {
    title: string;
    description: string;
  };
  categories: {
    title: string;
    all: string;
  };
  searchConfig: {
    title: string;
    placeholder: string;
    button: string;
    clear: string;
    tips: {
      title: string;
      excerpt: string;
      content: string;
      tags: string;
    };
  };
  showingResults: string;
  noPostsFound: {
    title: string;
    description: string;
  };
  noSearchResults: {
    title: string;
    description: string;
  };
  noCategoryPosts: {
    title: string;
    description: string;
  };
  anonymous: string;
  unpublished: string;
  post: {
    backToBlog: string;
    tags: string;
    notFound: string;
    error: string;
    errorDescription: string;
  };
  comments: {
    title: string;
    addComment: string;
    placeholder: string;
    submit: string;
    submitting: string;
    reply: string;
    replyPlaceholder: string;
    submitReply: string;
    cancel: string;
    noComments: string;
    beFirst: string;
  };
  relatedPosts: {
    title: string;
    viewAll: string;
  };
}

export interface HelpMessages {
  title: string;
  subtitle: string;
  search: {
    placeholder: string;
  };
  categories: {
    gettingStarted: {
      title: string;
      description: string;
    };
    account: {
      title: string;
      description: string;
    };
    shopping: {
      title: string;
      description: string;
    };
    orders: {
      title: string;
      description: string;
    };
    payment: {
      title: string;
      description: string;
    };
    viewGuides: string;
  };
  faqs: {
    title: string;
    subtitle: string;
    shipping: {
      question: string;
      answer: string;
    };
    returns: {
      question: string;
      answer: string;
    };
    payment: {
      question: string;
      answer: string;
    };
    account: {
      question: string;
      answer: string;
    };
    tracking: {
      question: string;
      answer: string;
    };
  };
  contact: {
    title: string;
    description: string;
    email: string;
    phone: string;
  };
}

// Complete messages structure type
export interface AppMessages {
  loading: string;
  Navigation: NavigationMessages;
  Authentication: AuthenticationMessages;
  "Admin Panel": AdminPanelMessages;
  Settings: SettingsMessages;
  "API Messages": Record<string, string>;
  "Toast Messages": Record<string, string>;
  "Form Validation": Record<string, any>;
  "Status Messages": StatusMessages;
  "Common Actions": CommonActions;
  Placeholders: Placeholders;
  Currencies: Currencies;
  "Time Periods": TimePeriods;
  "Error Messages": Record<string, string>;
  Confirmations: Record<string, string>;
  Analytics: Record<string, string>;
  "Footer & Additional UI": Record<string, string>;
  "Theme Colors": Record<string, any>;
  "Product Related": ProductRelatedMessages;
  "Checkout & Cart": CheckoutCartMessages;
  "Cart Operations": CartOperationsMessages;
  "Cart Messages": CartMessages;
  "Cart Sidebar": CartSidebarMessages;
  "Checkout Steps": CheckoutStepsMessages;
  "Guest Checkout": GuestCheckoutMessages;
  "Shipping Information": ShippingInformationMessages;
  "Payment Information": PaymentInformationMessages;
  "Order Review": OrderReviewMessages;
  "Order Status": OrderStatusMessages;
  "Form Validation - Cart & Checkout": Record<string, any>;
  "Error Messages - Cart & Checkout": Record<string, any>;
  "Success Messages": Record<string, string>;
  "Terms and Conditions": Record<string, string>;
  "User Actions": Record<string, string>;
  "Status and Messages": Record<string, string>;
  "Admin Specific": Record<string, string>;
  "Admin Dashboard": Record<string, any>;
  "Language Settings": Record<string, any>;
  "Product Suggestions": Record<string, any>;
  "Site Settings": Record<string, any>;
  "Multilingual Tips": Record<string, any>;
  "Product Comparison": Record<string, any>;
  "Recently Viewed": Record<string, string>;
  "Social Sharing": Record<string, string>;
  Home: HomeMessages;
  products: Record<string, any>;
  categories: Record<string, any>;
  cart: Record<string, string>;
  auth: Record<string, any>;
  SEO: SEOMessages;
  Contact: ContactMessages;
  blog: {
    title: string;
    readMore: string;
    noPosts: string;
    description: string;
    keywords: string;
  };
  Blog: BlogMessages;
  Help: HelpMessages;
}

// Type-safe translation function
export type TranslationFunction = (
  key: keyof AppMessages | string,
  values?: Record<string, any>,
) => string;

// Type-safe getTranslations function return type
export type GetTranslationsReturn = ((
  key: keyof AppMessages | string,
  values?: Record<string, any>,
) => string) & {
  [K in keyof AppMessages]: AppMessages[K] extends Record<string, any>
    ? GetTranslationsReturn
    : TranslationFunction;
};

// Type-safe useTranslations hook return type
export type UseTranslationsReturn = GetTranslationsReturn & {
  locale: AppLocale;
};
