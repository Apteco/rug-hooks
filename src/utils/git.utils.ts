import simpleGit, { SimpleGit } from 'simple-git';

export type ChangedFile = string;

export interface GitUtils {
  getStagedChanges: () => Promise<Array<ChangedFile>>;
}

export class SimpleGitUtils implements GitUtils {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  public async getStagedChanges(): Promise<ChangedFile[]> {
    const diffs = await this.git.diffSummary('--staged');
    const textDiffs = diffs.files.filter((file) => !file.binary);
    return textDiffs.map((file) => file.file);
  }
}
