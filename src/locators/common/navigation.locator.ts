/**
 * Navigation Locators — Locators Layer
 *
 * Centralizes all selectors for the left-side navigation menubar.
 * Page objects consume this map via LocatorResolver — never hardcode
 * selectors directly inside page methods.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 * attributes on the actual application UI.
 */

export const navigationLocators = {
  // ── Left sidebar links ───────────────────────────────────────────────────
  records: "[data-testid='nav-records']",
  dashboard: "[data-testid='nav-dashboard']",
  reports: "[data-testid='nav-reports']",
  settings: "[data-testid='nav-settings']",
  userManagement: "[data-testid='nav-user-management']",

  // ── Top header elements ──────────────────────────────────────────────────
  userAvatar: "[data-testid='header-user-avatar']",
  logoutButton: "[data-testid='header-logout-btn']",
  notificationBell: "[data-testid='header-notification-bell']",
} as const;

export type NavigationLocatorKey = keyof typeof navigationLocators;
