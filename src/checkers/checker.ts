import { Config } from '../config';

export interface CheckerResults {
  name: string;
  success: boolean;
  fails?: Array<string>;
}

export interface Checker {
  run: (config: Config) => Promise<CheckerResults>;
}
