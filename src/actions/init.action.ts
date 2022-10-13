import * as fs from 'fs';
import * as winston from 'winston';

import { defaultConfig } from '../config';

export const initAction = (logger: winston.Logger) => (path: string) => {
  logger.debug(`Creating default config at: ${path}`);
  if (fs.existsSync(path)) {
    logger.warn(`Default config already exists at: ${path} `);
    return;
  }
  fs.writeFileSync(path, JSON.stringify(defaultConfig, null, 2));
  logger.debug(`Default config created at: ${path}`);
};
