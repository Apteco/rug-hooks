import * as fs from 'fs';
import { DependencyContainer } from 'tsyringe';
import * as winston from 'winston';

import { Checker, CheckerResults, ForbiddenTokensChecker, LockfileVersionChecker } from '../checkers';
import { loadConfig } from '../config';

interface CheckerMap {
  [name: string]: any;
}

const checkerMap: CheckerMap = {
  ['forbidden-tokens']: ForbiddenTokensChecker,
  ['ft']: ForbiddenTokensChecker,
  ['lockfile-version']: LockfileVersionChecker,
  ['lv']: LockfileVersionChecker,
};

const navigateToGitRoot = (logger: winston.Logger) => {
  let previousDir = process.cwd();
  while (!fs.existsSync('.git')) {
    try {
      process.chdir('../');
      if (process.cwd() === previousDir) {
        logger.error('Could not navigate to git root');
        process.exit(1);
      }
      previousDir = process.cwd();
    } catch (err) {
      logger.error('Could not navigate to git root');
      process.exit(1);
    }
  }
};

const getCheckers = (checkers: Array<string>): Array<any> =>
  checkers.map((checker) => checkerMap[checker]).reduce((u, i) => (u.includes(i) ? u : [...u, i]), []);

export const runAction =
  (logger: winston.Logger, container: DependencyContainer) =>
  async (checkers: Array<string>, options: { debug: boolean; config: string }) => {
    if (options.debug) {
      logger.level = 'debug';
    }

    navigateToGitRoot(logger);

    const config = loadConfig(options.config ?? './.rughooksrc.json', logger);

    let exitCode = 0;
    const results: Array<CheckerResults> = [];

    const toRun = getCheckers(checkers);
    for (let checkerType of toRun) {
      const checker: Checker = container.resolve(checkerType);
      const result = await checker.run(config);
      results.push(result);
    }

    results.forEach((result) => {
      if (result.success) {
        return;
      }
      logger.info(result.name);
      if (result.fails) {
        exitCode += result.fails.length;
        result.fails.forEach(logger.warn);
      } else {
        exitCode += 1;
      }
    });
    process.exit(exitCode);
  };
