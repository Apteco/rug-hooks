import * as fs from 'fs';

export interface FileSystemUtils {
  exists(path: fs.PathLike): boolean;
  readFile(path: fs.PathLike): string;
}

export class FsFileSystemUtils implements FileSystemUtils {
  public exists(path: fs.PathLike): boolean {
    return fs.existsSync(path);
  }

  public readFile(path: fs.PathLike): string {
    return fs.readFileSync(path, { encoding: 'utf8' });
  }
}
