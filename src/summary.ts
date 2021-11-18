import { readFileSync } from "fs";
import mustache from "mustache";
import * as path from "path";
import { SimpleGit } from "simple-git";
import * as vscode from "vscode";
import { calculateProjectChurn, getTopRankedChurnFiles } from "./churn";
import { getExtensionConfig } from "./configuration";
import { ProjectSummaryData } from "./types";
import { workspaceRelativeFilename } from "./util";
import { getFileCoupling } from "./coupling";

export function createProjectSummaryPanel(context: vscode.ExtensionContext, git: SimpleGit): void {
  renderProjectSummary(git, context);
}

export function createFileSummaryPanel(context: vscode.ExtensionContext, git: SimpleGit): void {
  const activeTextEditor = vscode.window.activeTextEditor;
  const activeFileName = activeTextEditor
    ? workspaceRelativeFilename(activeTextEditor?.document.fileName)
    : null;

  if (!activeFileName) {
    return;
  }

  renderFileSummary(git, activeFileName, context);
}

function renderFileSummary(
  git: SimpleGit,
  activeFile: string,
  context: vscode.ExtensionContext
): vscode.WebviewPanel {
  const config = getExtensionConfig();
  const panel = vscode.window.createWebviewPanel(
    "upliftCode.summary",
    "Uplift Code: File Summary",
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );
  panel.webview.html = "Loading...";
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "open-file":
        vscode.window.showTextDocument(vscode.Uri.file(message.href)).then(
          (accept) => {},
          (err) => console.log("Failed to open file: ", err)
        );
        break;
    }
  });

  Promise.all([calculateProjectChurn(git), getFileCoupling(activeFile, git)]).then(
    ([churn, coupling]) => {
      const rootUri = vscode.workspace.workspaceFolders![0].uri;

      const fileChurn = churn.get(activeFile) ?? 0;
      panel.webview.html = renderTemplate(context, "templates/fileSummary.html", {
        currentFileName: activeFile,
        currentFileChurn: fileChurn,
        since: config.since,
        coupling: Array.from(coupling.entries()).map(([file, count]) => ({
          file,
          ratio: ((count / fileChurn) * 100).toFixed(2),
          href: path.join(rootUri.fsPath, file),
        })),
      });
    }
  );

  return panel;
}

function renderProjectSummary(
  git: SimpleGit,
  context: vscode.ExtensionContext
): vscode.WebviewPanel {
  const config = getExtensionConfig();
  const panel = vscode.window.createWebviewPanel(
    "upliftCode.summary",
    "Uplift Code: Project Summary",
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );
  panel.webview.html = "Loading...";

  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "open-file":
        vscode.window.showTextDocument(vscode.Uri.file(message.href));
        break;
    }
  });

  calculateProjectSummaryData(git).then((data) => {
    panel.webview.html = renderTemplate(context, "templates/projectSummary.html", {
      ...data,
      since: config.since,
    });
  });

  return panel;
}

function renderTemplate(
  context: vscode.ExtensionContext,
  templatePath: string,
  data: unknown
): string {
  const templateFilePath = vscode.Uri.file(path.join(context.extensionPath, templatePath));
  const template = readFileSync(templateFilePath.fsPath);
  return mustache.render(template.toString(), data);
}

async function calculateProjectSummaryData(git: SimpleGit): Promise<ProjectSummaryData> {
  const churnMap = await calculateProjectChurn(git);

  const rootUri = vscode.workspace.workspaceFolders![0].uri;
  const items = Array.from(getTopRankedChurnFiles(churnMap, 25)).map(([file, churn]) => ({
    file: file,
    href: path.join(rootUri.fsPath, file),
    churn,
  }));

  return { items };
}
