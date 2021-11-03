import { render } from "mustache";
import { readFileSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { InsightsContext } from "../types";
import { getTopRankedChurnFiles } from "../churn";

export function createProjectSummaryPanel(
  context: vscode.ExtensionContext,
  { fileChurnMap, avgChurn }: InsightsContext
): vscode.WebviewPanel {
  // https://code.visualstudio.com/api/extension-guides/webview

  const rootUri = vscode.workspace.workspaceFolders![0].uri;

  const items = Array.from(getTopRankedChurnFiles(fileChurnMap, 25)).map(
    ([file, churn]) => ({
      file: vscode.Uri.file(path.join(rootUri.fsPath, file)),
      href: vscode.Uri.file(path.join(rootUri.fsPath, file)),
      churn,
    })
  );

  const panel = vscode.window.createWebviewPanel(
    "codeInsights.summary",
    "Code Insights: Project Summary",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const templateFilePath = vscode.Uri.file(
    path.join(context.extensionPath, "src/summary/summary.html")
  );

  const template = readFileSync(templateFilePath.fsPath);
  panel.webview.html = render(template.toString(), { avgChurn, items });
  return panel;
}
