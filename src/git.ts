import { SimpleGit } from "simple-git";

export async function execRawGitCommand(
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
