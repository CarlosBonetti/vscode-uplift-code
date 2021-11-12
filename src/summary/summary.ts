import mustache from "mustache";
import { readFileSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { InsightsContext } from "../types";
import { getTopRankedChurnFiles } from "../churn";
import { SimpleGit } from "simple-git";
import { workspaceRelativeFilename } from "../util";

export function createProjectSummaryPanel(
  context: vscode.ExtensionContext,
  git: SimpleGit,
  { fileChurnMap, avgChurn }: InsightsContext
): vscode.WebviewPanel {
  // https://code.visualstudio.com/api/extension-guides/webview

  const rootUri = vscode.workspace.workspaceFolders![0].uri;

  const activeTextEditor = vscode.window.activeTextEditor;
  const activeFileName = activeTextEditor
    ? workspaceRelativeFilename(activeTextEditor?.document.fileName)
    : null;

  const items = Array.from(getTopRankedChurnFiles(fileChurnMap, 25)).map(
    ([file, churn]) => ({
      file: file,
      href: path.join(rootUri.fsPath, file),
      churn,
    })
  );

  const panel = vscode.window.createWebviewPanel(
    "upliftCode.summary",
    "Uplift Code: Project Summary",
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );

  const templateFilePath = vscode.Uri.file(
    path.join(context.extensionPath, "src/summary/summary.html")
  );

  const template = readFileSync(templateFilePath.fsPath);
  panel.webview.html = mustache.render(template.toString(), {
    avgChurn,
    items,
    currentFileName: activeFileName,
    currentFileChurn: activeFileName ? fileChurnMap.get(activeFileName) : null,
  });

  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "open-file":
        vscode.window.showTextDocument(vscode.Uri.file(message.href));
        break;
    }
  });
  return panel;
}
