import { SimpleGit } from "simple-git";
import { getExtensionConfig } from "../../configuration";
import { createExcludePatternsFilter } from "../../util";

export async function getFileCoupling(file: string, git: SimpleGit): Promise<Map<string, number>> {
  const { excludePatterns, since } = getExtensionConfig();

  const result = await git.raw([
    "log",
    "--all",
    "--find-renames",
    "--find-copies",
    "--name-only",
    "--format=format:",
    `--since=${since}`,
  ]);

  const filterExcludePatterns = createExcludePatternsFilter(excludePatterns);
  const { allCommits } = result
    .split(/\r\n|\r|\n/)
    .filter(filterExcludePatterns)
    .reduce(
      ({ currentCommit, allCommits }, file) => {
        let commitArr = !currentCommit ? [] : currentCommit;
        if (!file) {
          commitArr = [];
        }

        if (file) {
          commitArr.push(file);
        }

        if (commitArr.length === 0) {
          allCommits.push(currentCommit);
        }

        return { currentCommit: commitArr, allCommits };
      },
      {
        currentCommit: new Array<string>(),
        allCommits: new Array<Array<string>>(),
      }
    );

  const parsedBuddies = allCommits
    .filter((commit) => commit.includes(file))
    .filter((commit) => commit.length > 1)
    .flatMap((commit) => commit)
    .filter((commitFile) => commitFile !== file)
    .reduce((map, fileName) => {
      map.set(fileName, (map.get(fileName) ?? 0) + 1);
      return map;
    }, new Map<string, number>());

  const sortedEntries = Array.from(parsedBuddies.entries())
    .sort(([file1, churn1], [file2, churn2]) => churn2 - churn1)
    .slice(0, 10);

  return new Map(sortedEntries);
}
