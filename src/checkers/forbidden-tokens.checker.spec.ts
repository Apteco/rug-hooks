import 'reflect-metadata';

import { container } from 'tsyringe';

import { ForbiddenTokensChecker, defaultOptions } from './forbidden-tokens.checker';

describe('Forbidden Tokens Checker', () => {
  let getStagedChanges: jest.Mock;
  let exists: jest.Mock;
  let readFile: jest.Mock;
  let debug: jest.Mock;
  let forbiddenTokenChecker: ForbiddenTokensChecker;

  let gitUtils: any;
  let fileSystemUtils: any;
  let logger: any;
  const options = {
    forbiddenTokens: defaultOptions,
  };

  beforeAll(() => {
    getStagedChanges = jest.fn();
    gitUtils = { getStagedChanges };

    exists = jest.fn();
    readFile = jest.fn();
    fileSystemUtils = { exists, readFile };

    debug = jest.fn();
    logger = { debug };
  });

  beforeEach(() => {
    getStagedChanges.mockReset();
    exists.mockReset();
    readFile.mockReset();

    container.clearInstances();
    container.registerInstance('GitUtils', gitUtils);
    container.registerInstance('FileSystemUtils', fileSystemUtils);
    container.registerInstance('Logger', logger);

    forbiddenTokenChecker = container.resolve(ForbiddenTokensChecker);
  });

  it('should return errors on file with forbidden tokens', async () => {
    getStagedChanges.mockImplementation(() => ['tests.spec.ts']);
    exists.mockImplementation((_path: string) => true);
    readFile.mockImplementation(
      (_path: string) => `fdescribe("Some describe", () => {})
		fit("Some it", () => {})
		it.only("Some it only", () => {})
		describe.only("Some describe only", () => {})
		debugger;`,
    );

    const results = await forbiddenTokenChecker.run(options);
    expect(results.success).toBe(false);
    expect(results.fails?.length).toBe(4);
  });

  it('should return success on a file with no errors', async () => {
    getStagedChanges.mockImplementation(() => ['tests.spec.ts']);
    exists.mockImplementation((_path: string) => true);
    readFile.mockImplementation(
      (_path: string) => `describe("Some describe", () => {})
		it("Some it", () => {})`,
    );

    const results = await forbiddenTokenChecker.run(options);
    expect(results.success).toBe(true);
    expect(results.fails).toBe(undefined);
  });

  it("should not run if file doesn't exist", async () => {
    getStagedChanges.mockImplementation(() => ['tests.spec.ts']);
    exists.mockImplementation((_path: string) => false);

    const results = await forbiddenTokenChecker.run(options);
    expect(getStagedChanges).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledTimes(1);
    expect(readFile).not.toHaveBeenCalled();
    expect(results.success).toBe(true);
  });

  it('should ignore a rule if its option is false', async () => {
    getStagedChanges.mockImplementation(() => ['tests.spec.ts']);
    exists.mockImplementation((_path: string) => true);
    readFile.mockImplementation((_path: string) => 'fdescribe("Some describe", () => {})');

    const results = await forbiddenTokenChecker.run({ ...options, forbiddenTokens: { fdescribe: false } });
    expect(results.success).toBe(true);
    expect(results.fails).toBe(undefined);
  });
});
