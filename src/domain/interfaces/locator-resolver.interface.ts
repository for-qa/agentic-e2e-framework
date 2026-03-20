/**
 * Locator Resolver Interface — Domain Layer
 *
 * Abstraction that decouples page-object code from the concrete
 * Playwright locator API. Allows different resolution strategies
 * (CSS, role-based, dynamic) without changing calling code.
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { ILocator, IPage } from "@src/domain/interfaces/page.interface";

/** A locator can be a CSS/text string, a role-based descriptor, or a factory function. */
export type LocatorDefinition =
  | string
  | { type: "getByRole"; role: string; name: string | RegExp }
  | ((...args: unknown[]) => string);

/** A map of string keys to LocatorDefinition values (one locator file = one LocatorSet). */
export type LocatorSet = Record<string, LocatorDefinition>;

export interface ILocatorResolver {
  resolveLocator<T extends LocatorSet>(
    page: IPage,
    locators: T,
    key: keyof T,
    ...args: unknown[]
  ): ILocator;
}
