import { SimpleGit } from "simple-git";
import { getExtensionConfig } from "../../configuration";
import { execRawGitCommand } from "../../git";
import { createExcludePatternsFilter } from "../../util";

export async function calculateProjectChurn(git: SimpleGit): Promise<Map<string, number>> {
  const { excludePatterns, since } = getExtensionConfig();

  const result = await execRawGitCommand(git, [
    "log",
    "--all",
    "--find-renames",
    "--find-copies",
    "--name-only",
    "--format=format:",
    `--since=${since}`,
  ]);

  const filterExcludePatterns = createExcludePatternsFilter(excludePatterns);

  const map = result.filter(filterExcludePatterns).reduce((map, fileName) => {
    map.set(fileName, (map.get(fileName) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return map;
}

export async function calculateFileChurn(git: SimpleGit, fileName: string): Promise<number> {
  const { since } = getExtensionConfig();

  const result = await execRawGitCommand(git, [
    "log",
    "--all",
    "--find-renames",
    "--find-copies",
    "--name-only",
    "--format=format:",
    `--since=${since}`,
    fileName,
  ]);

  return result.length;
}

export function getTopRankedChurnFiles(
  fileChurnMap: Map<string, number>,
  size = 10
): Map<string, number> {
  const entries = Array.from(fileChurnMap.entries());
  const sortedEntries = entries
    .sort(([file1, churn1], [file2, churn2]) => churn2 - churn1)
    .slice(0, size);

  return new Map(sortedEntries);
}

export function calculateChurnScore(churn: number, avg: number, max: number): number {
  // wolfram: solve for a: 1 - a log(1) = 1 and 1 - a log(M) = 0 and 1 - a log(V) = 0.75
  // const a = 3 / (10 * Math.log(avg)); // for f(avg) = 0.7
  // const a = 1 / (5 * Math.log(avg)); // for f(avg) = 0.8
  const a = 1 / (4 * Math.log(avg)); // for f(avg) = 0.75
  // const a = 1 / Math.log(max);
  return 1 - a * Math.log(churn);
}
