import { SimpleGit } from "simple-git";

const since = "18.month";

export function calculateProjectChurn(
  git: SimpleGit
): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    git
      .raw(
        "log",
        "--all",
        "-M",
        "-C",
        "--format=format:",
        "--name-only",
        `--since=${since}`
      )
      .then((result) => {
        const map = extractResultLines(result).reduce((map, fileName) => {
          map.set(fileName, (map.get(fileName) ?? 0) + 1);
          return map;
        }, new Map<string, number>());

        resolve(map);
      });
  });
}

export function calculateFileChurn(
  git: SimpleGit,
  fileName: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    git
      .raw(
        "log",
        "--format=format:",
        "--name-only",
        "--follow",
        `--since=${since}`,
        fileName
      )
      .then((result) => {
        const churn = extractResultLines(result).length;

        resolve(churn);
      });
  });
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
