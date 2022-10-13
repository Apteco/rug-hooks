import chalk from 'chalk';
import * as winston from 'winston';

const chalkFormatter: winston.Logform.Format = winston.format.printf((info) => {
  switch (info.level.toLowerCase()) {
    case 'info':
      return info.message;
    case 'debug':
      return chalk.gray(info.message);
    case 'error':
      return chalk.red(info.message);
    case 'warn':
      return chalk.yellow(info.message);
  }
  return info.message;
});

export const createLogger = () =>
  winston.createLogger({
    level: 'info',
    format: chalkFormatter,
    transports: [new winston.transports.Console({ format: chalkFormatter })],
  });
