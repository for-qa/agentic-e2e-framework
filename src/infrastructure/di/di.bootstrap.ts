/**
 * DI Bootstrap — Infrastructure Layer
 *
 * Creates every service and registers it with the ServiceContainer.
 * This is the single entry-point for wiring up the dependency graph.
 * Call `bootstrapServices()` in global test setup, or just import
 * this module (auto-bootstraps on first load).
 *
 * Order matters: dependencies must be created before dependants.
 *   1. Logger    (no deps)
 *   2. Config    (needs Logger)
 *   3. LocatorResolver (no deps)
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import { serviceContainer } from "@src/infrastructure/di/service.container";
import { Logger } from "@src/infrastructure/implementations/logger.implementation";
import { ConfigService } from "@src/infrastructure/implementations/config.implementation";
import { LocatorResolver } from "@src/infrastructure/implementations/locator-resolver.implementation";

export function bootstrapServices(): void {
  // 1. Logger — singleton, no external deps
  const logger = Logger.getInstance();
  serviceContainer.register("ILogger", logger);

  // 2. Config — depends on Logger for error reporting
  const configService = new ConfigService(logger);
  serviceContainer.register("IConfigService", configService);

  // 3. LocatorResolver — stateless, no deps
  const locatorResolver = new LocatorResolver();
  serviceContainer.register("ILocatorResolver", locatorResolver);

  logger.debug("DI container bootstrapped", "Bootstrap");
}

// Auto-bootstrap when this module is first imported.
bootstrapServices();
