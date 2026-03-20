/**
 * Config Service Implementation — Infrastructure Layer
 *
 * Reads environment variables and provides typed, validated access
 * to configuration values and user credentials.
 *
 * Users are loaded from env vars following the pattern:
 *   ADMIN_USER=admin@example.com
 *   ADMIN_USER_PASS=securepassword
 *
 * Pattern: implements IConfigService (Dependency Inversion Principle)
 *
 * Sanitized for public portfolio — see CASE_STUDY.md for context.
 */

import type { IConfigService } from "@src/domain/interfaces/config-service.interface";
import type { ILogger } from "@src/domain/interfaces/logger.interface";

export class MissingEnvironmentVariableError extends Error {
  constructor(key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = "MissingEnvironmentVariableError";
  }
}

export class ConfigService implements IConfigService {
  private users: Record<string, { username: string; password: string }> = {};

  constructor(private readonly logger: ILogger) {
    this.initializeUsers();
  }

  getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key] ?? defaultValue;
    if (!value) {
      this.logger.error(`Environment variable '${key}' is required but not set`);
      throw new MissingEnvironmentVariableError(key);
    }
    return value;
  }

  getEnvOptional(key: string): string | undefined {
    return process.env[key];
  }

  getUserData(key: string): { username: string; password: string } | undefined {
    const user = this.users[key];
    if (!user) {
      this.logger.warn(`User data not found for key: ${key}`);
    }
    return user;
  }

  requireUserData(key: string): { username: string; password: string } {
    const user = this.getUserData(key);
    if (!user) {
      throw new Error(
        `Required user data not found for key: "${key}". Ensure the corresponding env vars are set.`
      );
    }
    return user;
  }

  getAvailableUserKeys(): string[] {
    return Object.keys(this.users);
  }

  /**
   * Reads TEST_TIMEOUT_<TYPE> from the environment.
   * Falls back to defaultValue if the env var is absent or invalid.
   */
  getTestTimeout(timeoutType: string, defaultValue: number): number {
    const envKey = `TEST_TIMEOUT_${timeoutType.toUpperCase()}`;
    const raw = this.getEnvOptional(envKey);
    if (raw) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
      this.logger.warn(
        `Invalid timeout value for ${envKey}: "${raw}". Using default ${defaultValue}ms`
      );
    }
    return defaultValue;
  }

  /**
   * Reads TEST_RETRY_<TYPE> from the environment.
   * Falls back to defaultValue if the env var is absent or invalid.
   */
  getTestRetry(retryType: string, defaultValue: number): number {
    const envKey = `TEST_RETRY_${retryType.toUpperCase()}`;
    const raw = this.getEnvOptional(envKey);
    if (raw) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
      this.logger.warn(
        `Invalid retry value for ${envKey}: "${raw}". Using default ${defaultValue}`
      );
    }
    return defaultValue;
  }

  /**
   * Loads user credentials from environment variables.
   *
   * Convention (from .env.example):
   *   ADMIN_USER=admin@example.com
   *   ADMIN_USER_PASS=securepassword
   *   VIEWER_USER=viewer@example.com
   *   VIEWER_USER_PASS=viewerpass
   */
  private initializeUsers(): void {
    const userKeys = ["admin_user", "viewer_user", "editor_user"];

    for (const userKey of userKeys) {
      const username = this.getEnvOptional(userKey.toUpperCase());
      const password = this.getEnvOptional(`${userKey.toUpperCase()}_PASS`);

      if (username && password) {
        // Register under full key e.g. "admin_user"
        this.users[userKey] = { username, password };
        // Also register without "_user" suffix e.g. "admin" for convenience
        const shortKey = userKey.replace(/_user$/, "");
        this.users[shortKey] = { username, password };
        this.logger.debug(`Loaded credentials for: ${shortKey}`);
      }
    }
  }
}
