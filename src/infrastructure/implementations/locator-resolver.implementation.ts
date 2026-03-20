/**
 * Locator Resolver Implementation — Infrastructure Layer
 *
 * Resolves a LocatorDefinition (CSS string | role descriptor | factory fn)
 * from a locator-set into a concrete ILocator using the provided IPage.
 *
 * This separates the "what to find" (locator files) from the "how to find it"
 * (Playwright API), enabling easy swapping of the underlying browser driver.
 *
 * Pattern: implements ILocatorResolver (Dependency Inversion Principle)
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type {
  ILocatorResolver,
  LocatorSet,
} from "@src/domain/interfaces/locator-resolver.interface";
import type { ILocator, IPage } from "@src/domain/interfaces/page.interface";
import type { ARIARole } from "@src/models/aria-role.type";

type RoleDescriptor = { type: "getByRole"; role: ARIARole; name: string | RegExp };

function isRoleDescriptor(obj: unknown): obj is RoleDescriptor {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj as Record<string, unknown>)["type"] === "getByRole" &&
    "role" in obj &&
    "name" in obj
  );
}

export class LocatorResolver implements ILocatorResolver {
  resolveLocator<T extends LocatorSet>(
    page: IPage,
    locators: T,
    key: keyof T,
    ...args: unknown[]
  ): ILocator {
    const def = locators[key];

    if (typeof def === "string") {
      return page.locator(def);
    }

    if (typeof def === "function") {
      const selector = (def as (...a: unknown[]) => string)(...args);
      return page.locator(selector);
    }

    if (isRoleDescriptor(def)) {
      return page.getByRole(def.role, { name: def.name });
    }

    throw new Error(`Unsupported locator definition for key: "${String(key)}"`);
  }
}
