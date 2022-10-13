import _ from 'lodash';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import { Config, ForbiddenTokensConfig } from '../config';

import { FileSystemUtils } from '../utils/file-system.utils';
import { GitUtils } from '../utils/git.utils';

import { Checker, CheckerResults } from './checker';

type Rule = {
  regex: RegExp;
  fileRegex: RegExp;
};

type TokenRuleMap = {
  [token: string]: Rule;
};

export const defaultOptions: ForbiddenTokensConfig = {
  fit: true,
  fdescribe: true,
  only: true,
  debugger: true,
};

@injectable()
export class ForbiddenTokensChecker implements Checker {
  private readonly fileMatchers = {
    tsjs: /\.(ts|js)x?$/,
    spec: /\.spec\.(t|j)s$/,
  };
  private readonly forbiddenTokens: TokenRuleMap = {
    fit: { regex: /fit\(/, fileRegex: this.fileMatchers.spec },
    fdescribe: { regex: /fdescribe\(/, fileRegex: this.fileMatchers.spec },
    only: {
      regex: /(describe|context|it)\.only/,
      fileRegex: this.fileMatchers.spec,
    },
    debugger: { regex: /(debugger);/, fileRegex: this.fileMatchers.tsjs },
  };

  constructor(
    @inject('GitUtils') private gitUtils: GitUtils,
    @inject('FileSystemUtils') private fsUtils: FileSystemUtils,
    @inject('Logger') private logger: Logger,
  ) {}

  public async run(config: Config): Promise<CheckerResults> {
    this.logger.debug('Running ForbiddenTokensChecker');
    const runOptions: ForbiddenTokensConfig = _.defaults(config.forbiddenTokens, defaultOptions);

    const rules: Array<string> = [];
    Object.keys(runOptions).forEach((key) => {
      if (runOptions[key]) {
        rules.push(key);
      }
    });

    const changedFiles = await this.gitUtils.getStagedChanges();
    const failures: Array<string> = [];

    changedFiles.forEach((file) => {
      if (!this.fsUtils.exists(file)) {
        return;
      }
      rules.forEach((rule) => {
        const toCheck = this.forbiddenTokens[rule];
        if (!toCheck.fileRegex.test(file)) {
          return;
        }
        this.logger.debug(`Checking file: ${file}`);
        const contents = this.fsUtils.readFile(file);
        if (toCheck.regex.test(contents)) {
          failures.push(`File "${file}" contains forbidden token "${rule}"`);
        }
      });
    });
    this.logger.debug(`Found ${failures.length} problems`);
    return {
      name: 'ForbiddenTokens',
      success: failures.length == 0,
      fails: failures.length > 0 ? failures : undefined,
    };
  }
}
