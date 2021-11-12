import vscode from "vscode";
import minimatch from "minimatch";

export function workspaceRelativeFilename(filename: string): string {
  const rootUri = vscode.workspace.workspaceFolders![0].uri;
  return filename.replace(rootUri.fsPath + "/", "");
}

export function createExcludePatternsFilter(patterns: string[]) {
  const filters = patterns.map((pattern) => minimatch.filter(pattern));
  return (target: string, index: number, array: string[]) =>
    filters.every((filter) => !filter(target, index, array));
}
