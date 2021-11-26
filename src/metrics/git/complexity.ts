import { DefaultLogFields, SimpleGit } from "simple-git";
import { getExtensionConfig } from "../../configuration";
import { calculateComplexity } from "../base/complexity";

interface ComplexityTrend {
  fileName: string;
  complexity: number;
  versions: Array<{
    log: DefaultLogFields;
    complexity: number;
  }>;
}

export async function calculateFileComplexityTrend(
  git: SimpleGit,
  fileName: string
): Promise<ComplexityTrend> {
  const config = getExtensionConfig();
  const fileLogs = await git.log([
    "--find-renames",
    "--find-copies",
    `--since=${config.since}`,
    fileName,
  ]);
  const fileVersions = await Promise.all(
    fileLogs.all.map((log) => git.show(`${log.hash}:${fileName}`))
  );
  const trend = fileVersions.map((version) => calculateComplexity(fileName, version));

  return {
    fileName,
    complexity: trend[0],
    versions: fileLogs.all.map((log, index) => ({
      log,
      complexity: trend[index],
    })),
  };
}
