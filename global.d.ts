import { routing } from "./i18n/routing";
import { AppMessages, AppLocale } from "./i18n/types";

declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: AppMessages;
  }
}

// Global type definitions
declare global {
  // Locale type for use throughout the app
  type Locale = AppLocale;

  // Messages type for type-safe translations
  type Messages = AppMessages;
}
