/**
 * Service Container — Infrastructure Layer
 *
 * A lightweight Dependency Injection (DI) container.
 * Services are registered once at startup and retrieved by interface key.
 * This removes constructor-level coupling between classes (DIP).
 *
 * Pattern: Service Locator + Singleton
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { ILogger } from "@src/domain/interfaces/logger.interface";
import type { IConfigService } from "@src/domain/interfaces/config-service.interface";
import type { ILocatorResolver } from "@src/domain/interfaces/locator-resolver.interface";

export class ServiceContainer {
  private static instance: ServiceContainer;
  private readonly services: Map<string, unknown> = new Map();

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /** Register a service under a string key (typically the interface name). */
  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  /** Retrieve a service by key. Throws if not registered. */
  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service "${key}" is not registered. Did you call bootstrapServices()?`);
    }
    return service as T;
  }

  /** Returns true if a service is registered under this key. */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /** Clears all registered services — useful in teardown hooks. */
  clear(): void {
    this.services.clear();
  }

  // ── Typed convenience accessors ───────────────────────────────────────────

  getLogger(): ILogger {
    return this.get<ILogger>("ILogger");
  }

  getConfigService(): IConfigService {
    return this.get<IConfigService>("IConfigService");
  }

  getLocatorResolver(): ILocatorResolver {
    return this.get<ILocatorResolver>("ILocatorResolver");
  }
}

/** Pre-created singleton instance — import this instead of calling getInstance(). */
export const serviceContainer = ServiceContainer.getInstance();
