import { readFileSync } from "fs";
import mustache from "mustache";
import * as path from "path";
import { SimpleGit } from "simple-git";
import * as vscode from "vscode";
import { getTopRankedChurnFiles } from "./churn";
import { InsightsContext } from "./types";
import { workspaceRelativeFilename } from "./util";

export function createProjectSummaryPanel(
  context: vscode.ExtensionContext,
  git: SimpleGit,
  insightsContext: InsightsContext
): vscode.WebviewPanel {
  // https://code.visualstudio.com/api/extension-guides/webview

  const activeTextEditor = vscode.window.activeTextEditor;
  const activeFileName = activeTextEditor
    ? workspaceRelativeFilename(activeTextEditor?.document.fileName)
    : null;

  if (!!activeFileName) {
    return renderFileSummary(
      activeFileName,
      insightsContext.fileChurnMap.get(activeFileName) || 0,
      context
    );
  }

  return renderProjectSummary(insightsContext, context);
}

function renderFileSummary(
  file: string,
  fileChurn: number,
  context: vscode.ExtensionContext
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    "upliftCode.summary",
    "Uplift Code: File Summary",
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );

  const templateFilePath = vscode.Uri.file(
    path.join(context.extensionPath, "templates/fileSummary.html")
  );

  const template = readFileSync(templateFilePath.fsPath);
  panel.webview.html = mustache.render(template.toString(), {
    currentFileName: file,
    currentFileChurn: fileChurn,
  });

  return panel;
}

function renderProjectSummary(
  { fileChurnMap, avgChurn }: InsightsContext,
  context: vscode.ExtensionContext
): vscode.WebviewPanel {
  const rootUri = vscode.workspace.workspaceFolders![0].uri;
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
    path.join(context.extensionPath, "templates/projectSummary.html")
  );

  const template = readFileSync(templateFilePath.fsPath);
  panel.webview.html = mustache.render(template.toString(), {
    avgChurn,
    items,
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