/**
 * Module for advanced-analytics
 *
 * Comprehensive analytics integration with multiple providers and privacy controls
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import React, { useCallback, useEffect, useRef } from "react";

// Type definitions for analytics
export interface ConversionData {
  id: string;
  value: number;
  currency: string;
  items?: Array<{
    id: string;
    name?: string;
    price?: number;
    quantity?: number;
  }>;
}

export interface UserTraits {
  email?: string;
  name?: string;
  age?: number;
  location?: string;
  subscriptionStatus?: string;
  userType?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | Date | undefined;
}

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: AnalyticsProperties;
  context?: {
    url: string;
    referrer?: string;
    userAgent: string;
    viewport: { width: number; height: number };
    locale: string;
    timezone: string;
  };
}

// Analytics configuration
export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  mixpanelToken?: string;
  hotjarId?: string;
  linkedinPartnerId?: string;
  twitterPixelId?: string;
  enableUserTracking: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableConversionTracking: boolean;
  privacySettings: {
    cookieConsentRequired: boolean;
    anonymizeIp: boolean;
    disableTracking: boolean;
    dataRetentionDays: number;
    allowedRegions: string[];
    blockedRegions: string[];
  };
  sampling: {
    performanceSampleRate: number; // 0-1
    userSampleRate: number; // 0-1
    errorSampleRate: number; // 0-1
  };
  integrations: {
    crm: boolean;
    emailMarketing: boolean;
    attribution: boolean;
    heatmaps: boolean;
  };
}

// Privacy and consent management
export class PrivacyManager {
  private consentGiven = false;
  private consentPreferences: Record<string, boolean> = {};

  constructor() {
    this.loadConsentFromStorage();
  }

  setConsent(consent: boolean, preferences: Record<string, boolean> = {}) {
    this.consentGiven = consent;
    this.consentPreferences = { ...preferences };

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "analytics-consent",
        JSON.stringify({
          consent,
          preferences,
          timestamp: Date.now(),
        }),
      );
    }

    // Dispatch consent change event
    window.dispatchEvent(
      new CustomEvent("analytics-consent-changed", {
        detail: { consent, preferences },
      }),
    );
  }

  getConsent(): boolean {
    return this.consentGiven;
  }

  getConsentPreferences(): Record<string, boolean> {
    return { ...this.consentPreferences };
  }

  isCategoryAllowed(category: string): boolean {
    if (!this.consentGiven) return false;
    return this.consentPreferences[category] !== false; // Default to true if not specified
  }

  private loadConsentFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("analytics-consent");
      if (stored) {
        const { consent, preferences } = JSON.parse(stored);
        this.consentGiven = consent;
        this.consentPreferences = preferences || {};
      }
    } catch (error) {
      console.warn("Failed to load analytics consent from storage:", error);
    }
  }

  resetConsent() {
    this.consentGiven = false;
    this.consentPreferences = {};

    if (typeof window !== "undefined") {
      localStorage.removeItem("analytics-consent");
    }
  }
}

// Analytics providers
abstract class AnalyticsProvider {
  protected config: AnalyticsConfig;
  protected privacy: PrivacyManager;

  constructor(config: AnalyticsConfig, privacy: PrivacyManager) {
    this.config = config;
    this.privacy = privacy;
  }

  abstract initialize(): Promise<void>;
  abstract trackEvent(event: AnalyticsEvent): Promise<void>;
  abstract trackPageView(url: string, title?: string): Promise<void>;
  abstract trackConversion(conversion: ConversionData): Promise<void>;
  abstract setUserProperties(properties: AnalyticsProperties): Promise<void>;
  abstract identifyUser(userId: string, traits?: UserTraits): Promise<void>;
  abstract resetUser(): Promise<void>;
  abstract getProviderName(): string;
  abstract isEnabled(): boolean;
}

// Google Analytics 4 Provider
class GoogleAnalyticsProvider extends AnalyticsProvider {
  private gtag: ((...args: unknown[]) => void) | null = null;

  async initialize(): Promise<void> {
    if (!this.config.googleAnalyticsId || !this.isEnabled()) return;

    return new Promise((resolve) => {
      // Load Google Analytics script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        this.gtag = function () {
          window.dataLayer.push(arguments);
        };
        this.gtag("js", new Date());
        this.gtag("config", this.config.googleAnalyticsId, {
          anonymize_ip: this.config.privacySettings.anonymizeIp,
          allow_google_signals: false,
          allow_ad_features: false,
        });
        resolve();
      };
    });
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.gtag || !this.isEnabled()) return;

    this.gtag("event", event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      custom_parameters: event.properties,
    });
  }

  async trackPageView(url: string, title?: string): Promise<void> {
    if (!this.gtag || !this.isEnabled()) return;

    this.gtag("config", this.config.googleAnalyticsId, {
      page_title: title,
      page_location: url,
    });
  }

  async trackConversion(conversion: ConversionData): Promise<void> {
    if (!this.gtag || !this.isEnabled()) return;

    // Track purchase/conversion
    this.gtag("event", "purchase", {
      transaction_id: conversion.id,
      value: conversion.value,
      currency: conversion.currency,
      items: conversion.items,
    });
  }

  async setUserProperties(properties: AnalyticsProperties): Promise<void> {
    if (!this.gtag || !this.isEnabled()) return;

    this.gtag("config", this.config.googleAnalyticsId, {
      custom_map: properties,
    });
  }

  async identifyUser(userId: string, traits?: UserTraits): Promise<void> {
    if (!this.gtag || !this.isEnabled()) return;

    this.gtag("config", this.config.googleAnalyticsId, {
      user_id: userId,
      user_properties: traits,
    });
  }

  async resetUser(): Promise<void> {
    if (!this.gtag || !this.isEnabled()) return;

    this.gtag("config", this.config.googleAnalyticsId, {
      user_id: null,
      user_properties: null,
    });
  }

  getProviderName(): string {
    return "Google Analytics";
  }

  isEnabled(): boolean {
    return (
      this.privacy.isCategoryAllowed("analytics") &&
      !this.config.privacySettings.disableTracking
    );
  }
}

// Mixpanel Provider
class MixpanelProvider extends AnalyticsProvider {
  private mixpanel: {
    init: (token: string, config: Record<string, unknown>) => void;
    track: (event: string, properties?: Record<string, unknown>) => void;
    identify: (userId: string) => void;
    people: {
      set: (traits: Record<string, unknown>) => void;
    };
    register: (properties: Record<string, unknown>) => void;
    reset: () => void;
  } | null = null;

  async initialize(): Promise<void> {
    if (!this.config.mixpanelToken || !this.isEnabled()) return;

    return new Promise((resolve) => {
      // Load Mixpanel script
      const script = document.createElement("script");
      script.innerHTML = `
        (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=0;e<j.length;e++)b(j[e]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
        mixpanel.init('${this.config.mixpanelToken}', {
          disable_persistence: !this.privacy.getConsent(),
          ignore_dnt: false,
        });
      `;
      document.head.appendChild(script);

      script.onload = () => {
        this.mixpanel = window.mixpanel;
        resolve();
      };
    });
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.mixpanel || !this.isEnabled()) return;

    this.mixpanel.track(event.event, {
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      ...event.properties,
    });
  }

  async trackPageView(url: string, title?: string): Promise<void> {
    if (!this.mixpanel || !this.isEnabled()) return;

    this.mixpanel.track("Page View", {
      page: url,
      title: title || document.title,
    });
  }

  async trackConversion(conversion: ConversionData): Promise<void> {
    if (!this.mixpanel || !this.isEnabled()) return;

    this.mixpanel.track("Purchase", {
      revenue: conversion.value,
      currency: conversion.currency,
      transaction_id: conversion.id,
      items: conversion.items,
    });
  }

  async setUserProperties(properties: AnalyticsProperties): Promise<void> {
    if (!this.mixpanel || !this.isEnabled()) return;

    this.mixpanel.register(properties);
  }

  async identifyUser(userId: string, traits?: UserTraits): Promise<void> {
    if (!this.mixpanel || !this.isEnabled()) return;

    this.mixpanel.identify(userId);
    if (traits) {
      this.mixpanel.people.set(traits);
    }
  }

  async resetUser(): Promise<void> {
    if (!this.mixpanel || !this.isEnabled()) return;

    this.mixpanel.reset();
  }

  getProviderName(): string {
    return "Mixpanel";
  }

  isEnabled(): boolean {
    return (
      this.privacy.isCategoryAllowed("analytics") &&
      !this.config.privacySettings.disableTracking
    );
  }
}

// Hotjar Provider
class HotjarProvider extends AnalyticsProvider {
  private hj: ((...args: unknown[]) => void) | null = null;

  async initialize(): Promise<void> {
    if (!this.config.hotjarId || !this.isEnabled()) return;

    return new Promise((resolve) => {
      // Load Hotjar script
      const script = document.createElement("script");
      script.innerHTML = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${this.config.hotjarId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      document.head.appendChild(script);

      script.onload = () => {
        this.hj = window.hj;
        resolve();
      };

      // Hotjar doesn't have a reliable onload, so resolve after a delay
      setTimeout(resolve, 2000);
    });
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.hj || !this.isEnabled()) return;

    // Hotjar primarily tracks heatmaps and recordings
    // Custom events are less common
    this.hj("event", event.event);
  }

  async trackPageView(url: string, title?: string): Promise<void> {
    // Hotjar automatically tracks page views
    return Promise.resolve();
  }

  async trackConversion(conversion: any): Promise<void> {
    if (!this.hj || !this.isEnabled()) return;

    this.hj("event", "purchase");
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    // Hotjar doesn't support custom user properties
    return Promise.resolve();
  }

  async identifyUser(
    userId: string,
    traits?: Record<string, any>,
  ): Promise<void> {
    if (!this.hj || !this.isEnabled()) return;

    this.hj("identify", userId, traits);
  }

  async resetUser(): Promise<void> {
    // Hotjar doesn't have a reset method
    return Promise.resolve();
  }

  getProviderName(): string {
    return "Hotjar";
  }

  isEnabled(): boolean {
    return (
      this.privacy.isCategoryAllowed("heatmaps") &&
      !this.config.privacySettings.disableTracking
    );
  }
}

// Facebook Pixel Provider
class FacebookPixelProvider extends AnalyticsProvider {
  private fbq: ((...args: unknown[]) => void) | null = null;

  async initialize(): Promise<void> {
    if (!this.config.facebookPixelId || !this.isEnabled()) return;

    return new Promise((resolve) => {
      // Load Facebook Pixel script
      const script = document.createElement("script");
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${this.config.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      script.onload = () => {
        this.fbq = window.fbq;
        resolve();
      };
    });
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.fbq || !this.isEnabled()) return;

    // Map events to Facebook Pixel standard events
    const pixelEvent = this.mapToPixelEvent(event);
    this.fbq("track", pixelEvent, event.properties);
  }

  async trackPageView(url: string, title?: string): Promise<void> {
    if (!this.fbq || !this.isEnabled()) return;

    this.fbq("track", "PageView");
  }

  async trackConversion(conversion: any): Promise<void> {
    if (!this.fbq || !this.isEnabled()) return;

    this.fbq("track", "Purchase", {
      value: conversion.value,
      currency: conversion.currency,
      content_ids: conversion.items?.map((item: any) => item.id),
    });
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    // Facebook Pixel doesn't support custom user properties directly
    return Promise.resolve();
  }

  async identifyUser(
    userId: string,
    traits?: Record<string, any>,
  ): Promise<void> {
    // Facebook Pixel doesn't support user identification
    return Promise.resolve();
  }

  async resetUser(): Promise<void> {
    // Facebook Pixel doesn't have a reset method
    return Promise.resolve();
  }

  private mapToPixelEvent(event: AnalyticsEvent): string {
    // Map custom events to Facebook Pixel standard events
    const eventMap: Record<string, string> = {
      view_product: "ViewContent",
      add_to_cart: "AddToCart",
      initiate_checkout: "InitiateCheckout",
      purchase: "Purchase",
      search: "Search",
      contact: "Lead",
      signup: "CompleteRegistration",
    };

    return eventMap[event.event] || "CustomEvent";
  }

  getProviderName(): string {
    return "Facebook Pixel";
  }

  isEnabled(): boolean {
    return (
      this.privacy.isCategoryAllowed("marketing") &&
      !this.config.privacySettings.disableTracking
    );
  }
}

// Main Analytics Manager
export class AnalyticsManager {
  private config: AnalyticsConfig;
  private privacy: PrivacyManager;
  private providers: AnalyticsProvider[] = [];
  private initialized = false;
  private sessionId: string;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.privacy = new PrivacyManager();
    this.sessionId = this.generateSessionId();

    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize all configured providers
    if (this.config.googleAnalyticsId) {
      this.providers.push(
        new GoogleAnalyticsProvider(this.config, this.privacy),
      );
    }

    if (this.config.mixpanelToken) {
      this.providers.push(new MixpanelProvider(this.config, this.privacy));
    }

    if (this.config.hotjarId) {
      this.providers.push(new HotjarProvider(this.config, this.privacy));
    }

    if (this.config.facebookPixelId) {
      this.providers.push(new FacebookPixelProvider(this.config, this.privacy));
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize all providers
    await Promise.all(
      this.providers.map((provider) =>
        provider.initialize().catch((error) => {
          console.warn(
            `Failed to initialize ${provider.getProviderName()}:`,
            error,
          );
        }),
      ),
    );

    this.initialized = true;
    console.log(
      "Analytics initialized with providers:",
      this.providers.map((p) => p.getProviderName()),
    );
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.initialized || this.config.privacySettings.disableTracking)
      return;

    // Sample the event based on configuration
    if (Math.random() > this.getSampleRate(event)) return;

    // Add context to event
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: new Date(),
      context: this.getContext(),
    };

    // Track with all enabled providers
    await Promise.all(
      this.providers
        .filter((provider) => provider.isEnabled())
        .map((provider) =>
          provider.trackEvent(enrichedEvent).catch((error) => {
            console.warn(
              `Failed to track event with ${provider.getProviderName()}:`,
              error,
            );
          }),
        ),
    );
  }

  async trackPageView(url?: string, title?: string): Promise<void> {
    const pageUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const pageTitle =
      title || (typeof document !== "undefined" ? document.title : "");

    await Promise.all(
      this.providers
        .filter((provider) => provider.isEnabled())
        .map((provider) =>
          provider.trackPageView(pageUrl, pageTitle).catch((error) => {
            console.warn(
              `Failed to track page view with ${provider.getProviderName()}:`,
              error,
            );
          }),
        ),
    );
  }

  async trackConversion(conversion: any): Promise<void> {
    if (!this.config.enableConversionTracking) return;

    await Promise.all(
      this.providers
        .filter((provider) => provider.isEnabled())
        .map((provider) =>
          provider.trackConversion(conversion).catch((error) => {
            console.warn(
              `Failed to track conversion with ${provider.getProviderName()}:`,
              error,
            );
          }),
        ),
    );
  }

  async identifyUser(
    userId: string,
    traits?: Record<string, any>,
  ): Promise<void> {
    if (!this.config.enableUserTracking) return;

    await Promise.all(
      this.providers
        .filter((provider) => provider.isEnabled())
        .map((provider) =>
          provider.identifyUser(userId, traits).catch((error) => {
            console.warn(
              `Failed to identify user with ${provider.getProviderName()}:`,
              error,
            );
          }),
        ),
    );
  }

  async resetUser(): Promise<void> {
    await Promise.all(
      this.providers
        .filter((provider) => provider.isEnabled())
        .map((provider) =>
          provider.resetUser().catch((error) => {
            console.warn(
              `Failed to reset user with ${provider.getProviderName()}:`,
              error,
            );
          }),
        ),
    );
  }

  setPrivacyConsent(
    consent: boolean,
    preferences: Record<string, boolean> = {},
  ) {
    this.privacy.setConsent(consent, preferences);
  }

  getPrivacyManager(): PrivacyManager {
    return this.privacy;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSampleRate(event: AnalyticsEvent): number {
    // Determine sample rate based on event type
    if (event.category === "performance") {
      return this.config.sampling.performanceSampleRate;
    } else if (event.category === "error") {
      return this.config.sampling.errorSampleRate;
    } else {
      return this.config.sampling.userSampleRate;
    }
  }

  private getContext(): AnalyticsEvent["context"] {
    if (typeof window === "undefined") return undefined;

    return {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

// React Hook for Analytics
export function useAnalytics() {
  const analyticsRef = useRef<AnalyticsManager | null>(null);

  const initializeAnalytics = useCallback((config: AnalyticsConfig) => {
    if (!analyticsRef.current) {
      analyticsRef.current = new AnalyticsManager(config);
      analyticsRef.current.initialize().catch(console.error);
    }
    return analyticsRef.current;
  }, []);

  const trackEvent = useCallback(
    (event: Omit<AnalyticsEvent, "sessionId" | "timestamp" | "context">) => {
      if (analyticsRef.current) {
        analyticsRef.current
          .trackEvent(event as AnalyticsEvent)
          .catch(console.error);
      }
    },
    [],
  );

  const trackPageView = useCallback((url?: string, title?: string) => {
    if (analyticsRef.current) {
      analyticsRef.current.trackPageView(url, title).catch(console.error);
    }
  }, []);

  const trackConversion = useCallback((conversion: any) => {
    if (analyticsRef.current) {
      analyticsRef.current.trackConversion(conversion).catch(console.error);
    }
  }, []);

  const identifyUser = useCallback(
    (userId: string, traits?: Record<string, any>) => {
      if (analyticsRef.current) {
        analyticsRef.current.identifyUser(userId, traits).catch(console.error);
      }
    },
    [],
  );

  const setPrivacyConsent = useCallback(
    (consent: boolean, preferences: Record<string, boolean> = {}) => {
      if (analyticsRef.current) {
        analyticsRef.current.setPrivacyConsent(consent, preferences);
      }
    },
    [],
  );

  const analytics = React.useMemo(() => {
    return analyticsRef.current;
  }, []); // Only compute once on mount

  return {
    initializeAnalytics,
    trackEvent,
    trackPageView,
    trackConversion,
    identifyUser,
    setPrivacyConsent,
    analytics,
  };
}

// Utility functions for common events
export const AnalyticsEvents = {
  // User events
  userSignUp: (method: string) => ({
    event: "sign_up",
    category: "user",
    action: "sign_up",
    label: method,
    properties: { method },
  }),

  userLogin: (method: string) => ({
    event: "login",
    category: "user",
    action: "login",
    label: method,
    properties: { method },
  }),

  userLogout: () => ({
    event: "logout",
    category: "user",
    action: "logout",
  }),

  // Product events
  viewProduct: (productId: string, productName: string) => ({
    event: "view_product",
    category: "product",
    action: "view",
    label: productId,
    properties: { productId, productName },
  }),

  addToCart: (productId: string, quantity: number, price: number) => ({
    event: "add_to_cart",
    category: "ecommerce",
    action: "add_to_cart",
    value: price * quantity,
    properties: { productId, quantity, price },
  }),

  // Checkout events
  initiateCheckout: (items: any[], total: number) => ({
    event: "initiate_checkout",
    category: "ecommerce",
    action: "initiate_checkout",
    value: total,
    properties: { items: items.length, total },
  }),

  purchase: (orderId: string, total: number, items: any[]) => ({
    event: "purchase",
    category: "ecommerce",
    action: "purchase",
    value: total,
    properties: { orderId, total, items: items.length },
  }),

  // Search events
  search: (query: string, results: number) => ({
    event: "search",
    category: "engagement",
    action: "search",
    label: query,
    properties: { query, results },
  }),

  // Error events
  errorOccurred: (error: Error, context: string) => ({
    event: "error",
    category: "error",
    action: "occurred",
    label: error.name,
    properties: {
      message: error.message,
      context,
      stack: error.stack?.substring(0, 500), // Limit stack trace
    },
  }),

  // Performance events
  performanceMetric: (metric: string, value: number) => ({
    event: "performance",
    category: "performance",
    action: "metric",
    label: metric,
    value,
    properties: { metric, value },
  }),
};

// Type definitions for global objects
declare global {
  interface Window {
    dataLayer: any[];
    mixpanel: any;
    hj: any;
    fbq: any;
    gtag: (...args: any[]) => void;
  }
}
