import * as Sentry from '@sentry/nextjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LogMeta = Record<string, unknown> | unknown;

interface Logger {
  error(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
}

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

const isServer = typeof window === 'undefined';

// ---------------------------------------------------------------------------
// Winston (server-only) — loaded via require() so webpack eliminates this
// code path from client bundles. `serverExternalPackages` in next.config.ts
// keeps Winston out of the server bundle too (loaded at runtime).
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WinstonLogger = any;

const globalForWinston = globalThis as unknown as {
  __winstonLogger?: WinstonLogger;
};

function getWinstonLogger(): WinstonLogger | null {
  if (!isServer) return null;

  if (globalForWinston.__winstonLogger) {
    return globalForWinston.__winstonLogger;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const winston = require('winston');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('winston-daily-rotate-file');

    const LOG_LEVEL =
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

    const instance = winston.createLogger({
      level: LOG_LEVEL,
      defaultMeta: { service: 'saas-boilerplate' },
      transports: [
        // All logs — daily rotated files
        new winston.transports.DailyRotateFile({
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
        // Error-only logs — daily rotated files
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      ],
    });

    // Console transport
    if (process.env.NODE_ENV !== 'production') {
      instance.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(
              ({
                timestamp,
                level,
                message,
                service: _s,
                ...meta
              }: Record<string, unknown>) => {
                const metaStr = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : '';
                return `${timestamp} [${level}]: ${message}${metaStr}`;
              },
            ),
          ),
        }),
      );
    } else {
      instance.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      );
    }

    // Singleton — prevent HMR duplication
    globalForWinston.__winstonLogger = instance;
    return instance;
  } catch {
    // Winston unavailable (e.g. edge runtime) — fall through to console
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sentry helpers
// ---------------------------------------------------------------------------

/** Normalize meta to a plain object for Sentry / Winston compatibility. */
function normalizeMeta(meta: LogMeta | undefined): Record<string, unknown> | undefined {
  if (meta === undefined || meta === null) return undefined;
  if (typeof meta === 'object' && !Array.isArray(meta)) return meta as Record<string, unknown>;
  return { value: meta };
}

function sentryCaptureError(message: string, meta?: LogMeta): void {
  try {
    const normalized = normalizeMeta(meta);
    const error =
      meta instanceof Error ? meta : (normalized?.error instanceof Error ? normalized.error : new Error(message));
    Sentry.captureException(error, { extra: normalized });
  } catch {
    // Sentry not initialized or DSN not set — silently skip
  }
}

function sentryBreadcrumb(
  level: 'warning' | 'info' | 'debug',
  message: string,
  meta?: LogMeta,
): void {
  try {
    Sentry.addBreadcrumb({
      level,
      message,
      data: normalizeMeta(meta) as Record<string, unknown> | undefined,
    });
  } catch {
    // Sentry not initialized — silently skip
  }
}

// ---------------------------------------------------------------------------
// Unified logger
//
// Server: Winston (file + console) + Sentry (errors)
// Client: console + Sentry (errors)
// ---------------------------------------------------------------------------

function createLogger(): Logger {
  const winston = getWinstonLogger();

  return {
    error(message: string, meta?: LogMeta) {
      sentryCaptureError(message, meta);

      if (winston) {
        winston.error(message, meta);
      } else {
        console.error(`[ERROR] ${message}`, meta ?? '');
      }
    },

    warn(message: string, meta?: LogMeta) {
      sentryBreadcrumb('warning', message, meta);

      if (winston) {
        winston.warn(message, meta);
      } else {
        console.warn(`[WARN] ${message}`, meta ?? '');
      }
    },

    info(message: string, meta?: LogMeta) {
      sentryBreadcrumb('info', message, meta);

      if (winston) {
        winston.info(message, meta);
      } else {
        console.info(`[INFO] ${message}`, meta ?? '');
      }
    },

    debug(message: string, meta?: LogMeta) {
      sentryBreadcrumb('debug', message, meta);

      if (winston) {
        winston.debug(message, meta);
      } else {
        console.debug(`[DEBUG] ${message}`, meta ?? '');
      }
    },
  };
}

export const logger: Logger = createLogger();
