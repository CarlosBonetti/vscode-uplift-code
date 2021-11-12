import vscode from "vscode";

export function workspaceRelativeFilename(filename: string): string {
  const rootUri = vscode.workspace.workspaceFolders![0].uri;
  return filename.replace(rootUri.fsPath + "/", "");
}
