import 'reflect-metadata';

import { program } from 'commander';
import { container } from 'tsyringe';

import { initAction, runAction } from './actions';
import { FsFileSystemUtils } from './utils/file-system.utils';
import { SimpleGitUtils } from './utils/git.utils';
import { createLogger } from './utils/logger';

const logger = createLogger();

container.register('Logger', { useValue: logger });
container.register('GitUtils', { useClass: SimpleGitUtils });
container.register('FileSystemUtils', { useClass: FsFileSystemUtils });

program.name('rug-hooks').description('CLI utility to bundle up and run some ReallyUsefulGit-Hooks').version('0.1.1');

program
  .command('init')
  .argument('[path]', 'Path to where the config file should be created', './.rughooksrc.json')
  .description('Create a new config file with some sensible defaults')
  .action(initAction(logger));

program
  .command('run')
  .argument('[checkers...]', 'List of checkers to run: (ft|forbidden-tokens), (lv|lockfile-version)')
  .option('-c, --config <config>', 'Path to config file in relation to git root')
  .option('-d, --debug', 'Set logging level to debug, use this if stuff starts going wrong')
  .description('Runs the checkers using the options from the config')
  .action(runAction(logger, container));
program.parse();
