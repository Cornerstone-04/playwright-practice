import path from 'path';

interface GetSnapshotPathProps {
  dirPath: string;
  testName: string;
}

export function getSnapshotPath({
  dirPath,
  testName,
}: GetSnapshotPathProps): string {
  return path.resolve(__dirname, dirPath, `${testName}.png`);
}
