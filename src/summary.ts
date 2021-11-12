import { readFileSync } from "fs";
import mustache from "mustache";
import * as path from "path";
import { SimpleGit } from "simple-git";
import * as vscode from "vscode";
import { calculateProjectChurn, getTopRankedChurnFiles } from "./churn";
import { getExtensionConfig } from "./configuration";
import { ProjectSummaryData } from "./types";
import { workspaceRelativeFilename } from "./util";

export function createProjectSummaryPanel(
  context: vscode.ExtensionContext,
  git: SimpleGit
): vscode.WebviewPanel {
  // https://code.visualstudio.com/api/extension-guides/webview

  const activeTextEditor = vscode.window.activeTextEditor;
  const activeFileName = activeTextEditor
    ? workspaceRelativeFilename(activeTextEditor?.document.fileName)
    : null;

  if (!!activeFileName) {
    return renderFileSummary(git, activeFileName, context);
  }

  return renderProjectSummary(git, context);
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

  calculateProjectChurn(git).then((map) => {
    panel.webview.html = renderTemplate(context, "templates/fileSummary.html", {
      currentFileName: activeFile,
      currentFileChurn: map.get(activeFile) ?? 0,
      since: config.since,
    });
  });

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
    panel.webview.html = renderTemplate(
      context,
      "templates/projectSummary.html",
      {
        ...data,
        since: config.since,
      }
    );
  });

  return panel;
}

function renderTemplate(
  context: vscode.ExtensionContext,
  templatePath: string,
  data: unknown
): string {
  const templateFilePath = vscode.Uri.file(
    path.join(context.extensionPath, templatePath)
  );
  const template = readFileSync(templateFilePath.fsPath);
  return mustache.render(template.toString(), data);
}

async function calculateProjectSummaryData(
  git: SimpleGit
): Promise<ProjectSummaryData> {
  const churnMap = await calculateProjectChurn(git);

  const rootUri = vscode.workspace.workspaceFolders![0].uri;
  const items = Array.from(getTopRankedChurnFiles(churnMap, 25)).map(
    ([file, churn]) => ({
      file: file,
      href: path.join(rootUri.fsPath, file),
      churn,
    })
  );

  return { items };
}
