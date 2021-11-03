import { SimpleGit } from "simple-git";
import minimatch from "minimatch";

const since = "18.month";

// TODO: create an extension config
const excludePatterns = [
  "**/package.json",
  "**/package-lock.json",
  "**/poetry.lock",
  "frontend/projects/main/src/locale/*",
  "docker/frontend/eslint/eslint_count_errors.sh",
  "docker/frontend/eslint/base_lint_report.txt",
];

function createExcludePatternsFilter(patterns: string[]) {
  const filters = patterns.map((pattern) => minimatch.filter(pattern));
  return (target: string, index: number, array: string[]) =>
    filters.every((filter) => !filter(target, index, array));
}

export async function calculateProjectChurn(
  git: SimpleGit
): Promise<Map<string, number>> {
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

export async function calculateFileChurn(
  git: SimpleGit,
  fileName: string
): Promise<number> {
  const result = await execRawGitCommand(git, [
    "log",
    "--format=format:",
    "--name-only",
    "--follow",
    `--since=${since}`,
    fileName,
  ]);

  return result.length;
}

async function execRawGitCommand(
  git: SimpleGit,
  commands: string[]
): Promise<string[]> {
  const result = await git.raw(commands);
  return extractResultLines(result);
}

function extractResultLines(result: string): string[] {
  return result
    .split(/\r\n|\r|\n/) // split by new lines
    .map((line) => line.trim()) // trim empty spaces / empty lines
    .filter((line) => !!line); // return only lines with actual content
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

export function calculateChurnScore(
  churn: number,
  avg: number,
  max: number
): number {
  // wolfram: solve for a: 1 - a log(1) = 1 and 1 - a log(M) = 0 and 1 - a log(V) = 0.75
  // const a = 3 / (10 * Math.log(avg)); // for f(avg) = 0.7
  // const a = 1 / (5 * Math.log(avg)); // for f(avg) = 0.8
  const a = 1 / (4 * Math.log(avg)); // for f(avg) = 0.75
  // const a = 1 / Math.log(max);
  return 1 - a * Math.log(churn);
}
