/**
 * Playwright Page Adapter — Infrastructure Layer
 *
 * Adapts Playwright's concrete Page and Locator classes to the domain
 * IPage / ILocator interfaces. This is the only place in the codebase
 * that directly imports from @playwright/test — all other code depends
 * on the domain abstractions instead.
 *
 * Pattern: Adapter (GoF) + Dependency Inversion Principle
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { Page, Locator as PlaywrightLocator } from "@playwright/test";
import type { IPage, ILocator } from "@src/domain/interfaces/page.interface";
import type { ARIARole } from "@src/models/aria-role.type";

// ─── Locator Adapter ──────────────────────────────────────────────────────────

export class PlaywrightLocatorAdapter implements ILocator {
  constructor(public readonly locator: PlaywrightLocator) {}

  async click(options?: { timeout?: number }): Promise<void> {
    await this.locator.click({ timeout: options?.timeout });
  }

  async fill(value: string, options?: { timeout?: number }): Promise<void> {
    await this.locator.fill(value, { timeout: options?.timeout });
  }

  async textContent(options?: { timeout?: number }): Promise<string | null> {
    return await this.locator.textContent({ timeout: options?.timeout });
  }

  async innerText(options?: { timeout?: number }): Promise<string> {
    return await this.locator.innerText({ timeout: options?.timeout });
  }

  async allInnerTexts(): Promise<string[]> {
    return await this.locator.allInnerTexts();
  }

  async isVisible(options?: { timeout?: number }): Promise<boolean> {
    return await this.locator.isVisible({ timeout: options?.timeout });
  }

  async waitFor(options?: {
    state?: "attached" | "detached" | "visible" | "hidden";
    timeout?: number;
  }): Promise<void> {
    await this.locator.waitFor({ state: options?.state, timeout: options?.timeout });
  }

  async count(): Promise<number> {
    return await this.locator.count();
  }

  first(): ILocator {
    return new PlaywrightLocatorAdapter(this.locator.first());
  }

  nth(index: number): ILocator {
    return new PlaywrightLocatorAdapter(this.locator.nth(index));
  }

  filter(options: { has: ILocator }): ILocator {
    const hasLocator = options.has as PlaywrightLocatorAdapter;
    return new PlaywrightLocatorAdapter(this.locator.filter({ has: hasLocator.locator }));
  }

  async getAttribute(name: string, options?: { timeout?: number }): Promise<string | null> {
    return await this.locator.getAttribute(name, { timeout: options?.timeout });
  }

  async isChecked(options?: { timeout?: number }): Promise<boolean> {
    return await this.locator.isChecked({ timeout: options?.timeout });
  }

  async scrollIntoViewIfNeeded(options?: { timeout?: number }): Promise<void> {
    await this.locator.scrollIntoViewIfNeeded({ timeout: options?.timeout });
  }

  async focus(options?: { timeout?: number }): Promise<void> {
    await this.locator.focus({ timeout: options?.timeout });
  }

  async press(key: string, options?: { delay?: number }): Promise<void> {
    await this.locator.press(key, options);
  }

  async pressSequentially(text: string, options?: { delay?: number }): Promise<void> {
    await this.locator.pressSequentially(text, options);
  }

  async boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return await this.locator.boundingBox();
  }

  async evaluateAll<T, R, Arg = unknown>(
    pageFunction: (elements: T[], arg?: Arg) => R,
    arg?: Arg
  ): Promise<R> {
    return await this.locator.evaluateAll(pageFunction as never, arg as never);
  }

  page(): IPage {
    return new PlaywrightPageAdapter(this.locator.page());
  }
}

// ─── Page Adapter ─────────────────────────────────────────────────────────────

export class PlaywrightPageAdapter implements IPage {
  constructor(private readonly page: Page) {}

  async goto(url: string, options?: { waitUntil?: string; timeout?: number }): Promise<void> {
    await this.page.goto(url, {
      waitUntil: options?.waitUntil as
        | "load"
        | "domcontentloaded"
        | "networkidle"
        | "commit"
        | undefined,
      timeout: options?.timeout,
    });
  }

  async click(selector: string, options?: { timeout?: number }): Promise<void>;
  async click(selector: ILocator, options?: { timeout?: number }): Promise<void>;
  async click(selector: unknown, options?: { timeout?: number }): Promise<void> {
    if (typeof selector === "string") {
      await this.page.click(selector, { timeout: options?.timeout });
    } else {
      await (selector as PlaywrightLocatorAdapter).click(options);
    }
  }

  async fill(selector: string, value: string): Promise<void>;
  async fill(selector: ILocator, value: string): Promise<void>;
  async fill(selector: unknown, value: string): Promise<void> {
    if (typeof selector === "string") {
      await this.page.fill(selector, value);
    } else {
      await (selector as PlaywrightLocatorAdapter).fill(value);
    }
  }

  locator(selector: string): ILocator {
    return new PlaywrightLocatorAdapter(this.page.locator(selector));
  }

  getByRole(role: ARIARole, options?: { name?: string | RegExp }): ILocator {
    return new PlaywrightLocatorAdapter(
      this.page.getByRole(role as never, { name: options?.name })
    );
  }

  async waitForLoadState(state: string, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForLoadState(state as "load" | "domcontentloaded" | "networkidle", {
      timeout: options?.timeout,
    });
  }

  async waitForEvent(event: string, options?: { timeout?: number }): Promise<unknown> {
    return await this.page.waitForEvent(event as never, { timeout: options?.timeout });
  }

  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  isClosed(): boolean {
    return this.page.isClosed();
  }

  async waitForURL(
    url: string | RegExp | ((url: URL) => boolean),
    options?: { timeout?: number }
  ): Promise<void> {
    await this.page.waitForURL(url, { timeout: options?.timeout });
  }

  context(): { storageState(options: { path: string }): Promise<void> } {
    return {
      storageState: async (options: { path: string }) => {
        await this.page.context().storageState({ path: options.path });
      },
    };
  }

  get keyboard() {
    return {
      press: async (key: string, options?: { delay?: number }): Promise<void> => {
        await this.page.keyboard.press(key, options);
      },
    };
  }

  get mouse() {
    return {
      click: async (
        x: number,
        y: number,
        options?: { delay?: number; button?: "left" | "right" | "middle" }
      ): Promise<void> => {
        await this.page.mouse.click(x, y, options);
      },
    };
  }

  url(): string {
    return this.page.url();
  }

  async evaluate<R, Arg = unknown>(
    pageFunction: (arg?: Arg) => R | Promise<R>,
    arg?: Arg
  ): Promise<R> {
    return await this.page.evaluate(pageFunction as never, arg);
  }

  /** Escape hatch: access the raw Playwright Page for advanced operations. */
  getPlaywrightPage(): Page {
    return this.page;
  }
}
