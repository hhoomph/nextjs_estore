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
  description: string;
  keywords: string;
  category: string;
  search: {
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
  error: {
    title: string;
    description: string;
  };
  categories: {
    title: string;
    all: string;
  };
  showingResults: string;
  noPosts: {
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
  noPostsFound: string;
  noPostsDescription: string;
  draft: string;
  previous: string;
  next: string;
  searchPlaceholder: string;
  allTags: string;
  allCategories: string;
  clearFilters: string;
  filters: string;
  filterDescription: string;
  tag: string;
  activeFilters: string;
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

export interface PrivacyPolicySectionMessages {
  title: string;
  description: string;
  items?: Record<string, string>;
}

export interface PrivacyPolicyMessages {
  title: string;
  lastUpdated: string;
  lastUpdatedText: string;
  informationWeCollect: PrivacyPolicySectionMessages;
  howWeUse: PrivacyPolicySectionMessages;
  dataProtection: PrivacyPolicySectionMessages;
  yourRights: PrivacyPolicySectionMessages;
  contact: PrivacyPolicySectionMessages;
}

export interface TermsConditionsMessages {
  title: string;
  acceptance: PrivacyPolicySectionMessages;
  useLicense: PrivacyPolicySectionMessages;
  orders: PrivacyPolicySectionMessages;
  pricing: PrivacyPolicySectionMessages;
  limitation: PrivacyPolicySectionMessages;
  governingLaw: PrivacyPolicySectionMessages;
  contact: PrivacyPolicySectionMessages;
}

export interface AdminDashboardMessages {
  loading: string;
  tryAgain: string;
  welcomeBack: string;
  dashboard: string;
  dashboardDescription: string;
  apexWorkspaceTheme: string;
  stats: {
    totalProducts: string;
    totalOrders: string;
    totalUsers: string;
    totalRevenue: string;
    fromLastMonth: string;
  };
  activeUsers: string;
  currentlyEngaged: string;
  allTime: string;
  products: string;
  activeListings: string;
  recentOrders: string;
  noRecentOrders: string;
  lowStockAlert: string;
  allProductsWellStocked: string;
  remaining: string;
  quickActions: string;
  addNewProduct: string;
  createNewProductListing: string;
  manageUsers: string;
  viewManageUserAccounts: string;
  settings: string;
  configureStorePreferences: string;
  goToPage: string;
  orderPrefix: string;
  guest: string;
  lowStock: string;
  viewAnalytics: string;
  checkSalesPerformance: string;
}

export interface AdminThemeSettingsMessages {
  workspaceStyling: string;
  themeSettings: string;
  themeSettingsDescription: string;
  themeMode: string;
  activeMode: string;
  currentTheme: string;
  colorTokens: string;
  presets: string;
  primary: string;
  primaryDescription: string;
  secondary: string;
  secondaryDescription: string;
  background: string;
  backgroundDescription: string;
  foreground: string;
  foregroundDescription: string;
  border: string;
  borderDescription: string;
  livePreview: string;
  primaryAction: string;
  secondarySurface: string;
  previewText: string;
  saving: string;
  saveTheme: string;
  reset: string;
  themeSettingsSaved: string;
  themeSettingsReset: string;
  light: string;
  dark: string;
  system: string;
}

export interface AdminProductsMessages {
  loading: string;
  commerceWorkspace: string;
  productManagement: string;
  productManagementDescription: string;
  addProduct: string;
  editProduct: string;
  addNewProduct: string;
  productName: string;
  category: string;
  selectCategory: string;
  description: string;
  quantity: string;
  price: string;
  discountPrice: string;
  status: string;
  seoSettings: string;
  seoTitle: string;
  seoTitlePlaceholder: string;
  seoDescription: string;
  seoDescriptionPlaceholder: string;
  seoKeywords: string;
  seoKeywordsPlaceholder: string;
  productImages: string;
  uploading: string;
  uploadImages: string;
  uploadHint: string;
  saving: string;
  updateProduct: string;
  createProduct: string;
  cancel: string;
  searchProducts: string;
  searching: string;
  filterByStatus: string;
  allStatus: string;
  active: string;
  inactive: string;
  productsCount: string;
  table: {
    product: string;
    category: string;
    price: string;
    stock: string;
    status: string;
    actions: string;
  };
  noProductsFound: string;
  tryAdjustingFilters: string;
  getStarted: string;
  atLeastOneImageRequired: string;
  productUpdated: string;
  productCreated: string;
  productDeleted: string;
  failedToFetchProducts: string;
  failedToFetchCategories: string;
  failedToSaveProduct: string;
  failedToLoadProduct: string;
  failedToDeleteProduct: string;
  maxImagesAllowed: string;
  maxImagesReached: string;
  invalidFileType: string;
  imageUploadFailed: string;
  areYouSureDelete: string;
  productNotFound: string;
}

export interface CheckoutMessages {
  loading: string;
  cartEmpty: string;
  cartEmptyMessage: string;
  continueShopping: string;
  home: string;
  cart: string;
  checkout: string;
  guestCheckout: string;
  secureCheckout: string;
  guestCheckoutDescription: string;
  authenticatedDescription: string;
  alreadyHaveAccount: string;
  signInForFasterCheckout: string;
  shipping: string;
  payment: string;
  review: string;
  selectShippingAddress: string;
  chooseAddress: string;
  continueToPayment: string;
  addNewAddress: string;
  addAddressDescription: string;
  paymentInformation: string;
  cardNumber: string;
  cardNumberPlaceholder: string;
  expiryDate: string;
  expiryPlaceholder: string;
  cvv: string;
  cvvPlaceholder: string;
  cardholderName: string;
  cardholderPlaceholder: string;
  backToShipping: string;
  processing: string;
  reviewOrder: string;
  orderReview: string;
  shippingAddress: string;
  paymentMethod: string;
  backToPayment: string;
  processingPayment: string;
  payAmount: string;
  failedToCreateOrder: string;
  checkoutError: string;
}

export interface AccountMessages {
  pleaseSignIn: string;
  signInRequired: string;
  signIn: string;
  signUp: string;
  home: string;
  account: string;
  user: string;
  administrator: string;
  customer: string;
  verified: string;
  settings: string;
  signOut: string;
  overview: string;
  orders: string;
  wishlist: string;
  addresses: string;
  totalOrders: string;
  lifetimeOrders: string;
  noOrdersYet: string;
  wishlistItems: string;
  savedForLater: string;
  wishlistEmpty: string;
  totalSpent: string;
  lifetimePurchases: string;
  noPurchasesYet: string;
  recentOrders: string;
  orderHistory: string;
  noOrdersYetDescription: string;
  startShopping: string;
  myWishlist: string;
  wishlistEmptyDescription: string;
  browseProducts: string;
  savedAddresses: string;
  noAddressesSaved: string;
  addressesDescription: string;
  addAddress: string;
  viewAllOrders: string;
  accountActions: string;
  accountSettings: string;
  orderHistoryLink: string;
  myWishlistLink: string;
  notifications: string;
}

export interface AdminOrdersMessages {
  loading: string;
  commerceWorkspace: string;
  orders: string;
  ordersDescription: string;
  searchOrders: string;
  filterByStatus: string;
  allStatus: string;
  pending: string;
  processing: string;
  shipped: string;
  delivered: string;
  cancelled: string;
  ordersCount: string;
  table: {
    orderId: string;
    customer: string;
    items: string;
    total: string;
    status: string;
    date: string;
    actions: string;
  };
  noOrdersFound: string;
  item: string;
  items: string;
  previous: string;
  pageXOfY: string;
  next: string;
  tryAgain: string;
  orderStatusUpdated: string;
  guest: string;
}

export interface AdminUsersMessages {
  loading: string;
  userAdministration: string;
  users: string;
  usersDescription: string;
  searchUsers: string;
  role: string;
  allRoles: string;
  userRole: string;
  adminRole: string;
  status: string;
  allStatus: string;
  active: string;
  inactive: string;
  usersCount: string;
  noUsersFound: string;
  table: {
    user: string;
    email: string;
    role: string;
    status: string;
    orders: string;
    joined: string;
    actions: string;
  };
  noName: string;
  previous: string;
  pageXOfY: string;
  next: string;
  confirmDeleteUser: string;
  userRoleUpdated: string;
  userStatusUpdated: string;
  userUpdated: string;
  userCreated: string;
  userDeleted: string;
}

export interface AdminAnalyticsMessages {
  loading: string;
  tryAgain: string;
  analyticsWorkspace: string;
  analytics: string;
  analyticsDescription: string;
  selectPeriod: string;
  last7Days: string;
  last30Days: string;
  last90Days: string;
  lastYear: string;
  stats: {
    totalRevenue: string;
    totalOrders: string;
    totalCustomers: string;
    averageOrderValue: string;
  };
  forTheSelectedPeriod: string;
  uniqueBuyers: string;
  perOrder: string;
  revenue: string;
  orders: string;
  newUsers: string;
  topProducts: string;
  noSalesDataAvailable: string;
  sold: string;
  categoryPerformance: string;
  noCategoryDataAvailable: string;
  salesTrend: string;
  userGrowth: string;
}

export interface AdminSettingsMessages {
  loading: string;
  settings: string;
  settingsDescription: string;
  lastSaved: string;
  generalSettings: string;
  siteName: string;
  siteNamePlaceholder: string;
  contactEmail: string;
  contactEmailPlaceholder: string;
  siteDescription: string;
  siteDescriptionPlaceholder: string;
  storeSettings: string;
  defaultCurrency: string;
  selectCurrency: string;
  lowStockThreshold: string;
  lowStockPlaceholder: string;
  maintenanceMode: string;
  maintenanceDescription: string;
  allowRegistration: string;
  registrationDescription: string;
  multilingualSettings: string;
  siteTitleFa: string;
  siteTitleFaPlaceholder: string;
  phoneFa: string;
  phoneFaPlaceholder: string;
  descriptionFa: string;
  descriptionFaPlaceholder: string;
  seoSettings: string;
  defaultSeoTitle: string;
  seoTitlePlaceholder: string;
  defaultSeoDescription: string;
  seoDescriptionPlaceholder: string;
  defaultOgImage: string;
  ogImagePlaceholder: string;
  analytics: string;
  googleAnalyticsId: string;
  gaPlaceholder: string;
  analyticsDescription: string;
  saving: string;
  saveSettings: string;
  themeCustomization: string;
  customizeThemeColors: string;
  themeCustomizationDescription: string;
  goToThemeSettings: string;
}

export interface DashboardMessages {
  loading: string;
  couldntLoad: string;
  tryAgain: string;
  welcomeBack: string;
  dashboardDescription: string;
  stats: {
    totalOrders: string;
    revenue: string;
    products: string;
  };
  inTheLastPeriod: string;
  lifetimeRevenue: string;
  lowOnStock: string;
  recentOrders: string;
  yourLastXOrders: string;
  noOrdersYet: string;
  startShopping: string;
  orderX: string;
  viewAllOrders: string;
  browseProducts: string;
  freshFromCatalog: string;
  noProductsAvailable: string;
  viewAllProducts: string;
  myWishlist: string;
  orderHistory: string;
  accountSettings: string;
  item: string;
}

export interface LegalMessages {
  privacyPolicy: PrivacyPolicyMessages;
  termsConditions: TermsConditionsMessages;
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
  "Admin Dashboard": AdminDashboardMessages;
  "Admin Theme Settings": AdminThemeSettingsMessages;
  "Admin Products": AdminProductsMessages;
  "Admin Orders": AdminOrdersMessages;
  "Admin Users": AdminUsersMessages;
  "Admin Analytics": AdminAnalyticsMessages;
  "Admin Settings": AdminSettingsMessages;
  "Language Settings": Record<string, any>;
  "Product Suggestions": Record<string, any>;
  "Site Settings": Record<string, any>;
  "Multilingual Tips": Record<string, any>;
  "Product Comparison": Record<string, any>;
  Dashboard: DashboardMessages;
  Checkout: CheckoutMessages;
  Account: AccountMessages;
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
  Legal: LegalMessages;
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
