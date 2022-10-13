import { inject, injectable } from 'tsyringe';
import _ from 'lodash';
import { Logger } from 'winston';

import { FileSystemUtils } from '../utils/file-system.utils';

import { Checker, CheckerResults } from './checker';
import { Config, LockfileConfig } from '../config';

export const defaultOptions: LockfileConfig = {
  path: `${process.cwd()}/package-lock.json`,
  version: 2,
};

@injectable()
export class LockfileVersionChecker implements Checker {
  constructor(@inject('FileSystemUtils') private fsUtils: FileSystemUtils, @inject('Logger') private logger: Logger) {}

  public async run(config: Config): Promise<CheckerResults> {
    this.logger.debug('Running LockfileVersionChecker');
    const runOptions = _.defaults(config.lockfile, defaultOptions);
    if (!runOptions.path || !this.fsUtils.exists(runOptions.path)) {
      return { name: 'LockfileVersion', success: true };
    }
    const contents = this.fsUtils.readFile(runOptions.path);
    let lockfile: { lockfileVersion: number };
    try {
      lockfile = JSON.parse(contents);
    } catch {
      return { name: 'LockfileVersion', success: false, fails: ['Lockfile is in an invalid format'] };
    }
    const valid = lockfile.lockfileVersion == runOptions['version'];
    this.logger.debug(`Lockfile is ${valid ? 'valid' : 'invalid'}`);
    return {
      name: 'LockfileVersion',
      success: valid,
      fails: valid ? undefined : [`LockfileVersion isn't "${runOptions['version']}"`],
    };
  }
}
