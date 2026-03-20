/**
 * Page & Locator Interfaces — Domain Layer
 *
 * Abstract contracts for browser page and element interactions.
 * Follows Dependency Inversion Principle (DIP) — high-level modules
 * depend on these abstractions, not on Playwright's concrete classes.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { ARIARole } from "@src/models/aria-role.type";

export interface ILocator {
  click(options?: { timeout?: number }): Promise<void>;
  fill(value: string, options?: { timeout?: number }): Promise<void>;
  textContent(options?: { timeout?: number }): Promise<string | null>;
  innerText(options?: { timeout?: number }): Promise<string>;
  allInnerTexts(): Promise<string[]>;
  isVisible(options?: { timeout?: number }): Promise<boolean>;
  waitFor(options?: {
    state?: "attached" | "detached" | "visible" | "hidden";
    timeout?: number;
  }): Promise<void>;
  count(): Promise<number>;
  first(): ILocator;
  nth(index: number): ILocator;
  filter(options: { has: ILocator }): ILocator;
  getAttribute(name: string, options?: { timeout?: number }): Promise<string | null>;
  isChecked(options?: { timeout?: number }): Promise<boolean>;
  scrollIntoViewIfNeeded(options?: { timeout?: number }): Promise<void>;
  focus(options?: { timeout?: number }): Promise<void>;
  press(key: string, options?: { delay?: number }): Promise<void>;
  pressSequentially(text: string, options?: { delay?: number }): Promise<void>;
  boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null>;
  evaluateAll<T, R, Arg = unknown>(
    pageFunction: (elements: T[], arg?: Arg) => R,
    arg?: Arg
  ): Promise<R>;
  page(): IPage;
}

export interface IPage {
  goto(url: string, options?: { waitUntil?: string; timeout?: number }): Promise<void>;
  click(selector: string | ILocator, options?: { timeout?: number }): Promise<void>;
  fill(selector: string | ILocator, value: string): Promise<void>;
  locator(selector: string): ILocator;
  getByRole(role: ARIARole, options?: { name?: string | RegExp }): ILocator;
  waitForLoadState(state: string, options?: { timeout?: number }): Promise<void>;
  waitForEvent(event: string, options?: { timeout?: number }): Promise<unknown>;
  waitForTimeout(ms: number): Promise<void>;
  waitForURL(
    url: string | RegExp | ((url: URL) => boolean),
    options?: { timeout?: number }
  ): Promise<void>;
  isClosed(): boolean;
  context(): {
    storageState(options: { path: string }): Promise<void>;
  };
  keyboard: {
    press(key: string, options?: { delay?: number }): Promise<void>;
  };
  mouse: {
    click(
      x: number,
      y: number,
      options?: { delay?: number; button?: "left" | "right" | "middle" }
    ): Promise<void>;
  };
  url(): string;
  evaluate<R, Arg = unknown>(pageFunction: (arg?: Arg) => R | Promise<R>, arg?: Arg): Promise<R>;
}
