import * as fs from 'fs';
import * as winston from 'winston';

export interface KeyedConfig {
  [key: string]: any;
}

export interface ForbiddenTokensConfig extends KeyedConfig {
  fit?: boolean;
  fdescribe?: boolean;
  only?: boolean;
  debugger?: boolean;
}

export interface LockfileConfig extends KeyedConfig {
  path?: string;
  version?: number;
}

export interface Config extends KeyedConfig {
  forbiddenTokens?: ForbiddenTokensConfig;
  lockfile?: LockfileConfig;
}

export const defaultConfig: Config = {
  forbiddenTokens: {
    fit: true,
    fdescribe: true,
    only: true,
    debugger: true,
  },
  lockfile: {
    path: './package-lock.json',
    version: 2,
  },
};

export const loadConfig = (configPath: string, logger: winston.Logger) => {
  try {
    const configContents = fs.readFileSync(configPath, { encoding: 'utf8' });
    return JSON.parse(configContents);
  } catch (_err) {
    logger.error(`Could not load config from: ${configPath}`);
    process.exit(1);
  }
};
