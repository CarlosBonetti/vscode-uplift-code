import path from "path";
import { SimpleGit } from "simple-git";
import vscode from "vscode";
import { getExtensionConfig } from "./configuration";
import { calculateProjectChurn, getTopRankedChurnFiles } from "./metrics/git/churn";
import { calculateFileComplexityTrend } from "./metrics/git/complexity";
import { getFileCoupling } from "./metrics/git/coupling";
import { FileSummaryPageProps } from "./pages/file-summary/FileSummaryPage.types";
import { ProjectSummaryPageProps } from "./pages/project-summary/ProjectSummaryPage.types";
import { ProjectSummaryData } from "./types";
import { workspaceRelativeFilename } from "./util";
import { createWebView } from "./webview";

export function createProjectSummaryPanel(context: vscode.ExtensionContext, git: SimpleGit): void {
  renderProjectSummary(git, context);
}

export async function createFileSummaryPanel(
  context: vscode.ExtensionContext,
  git: SimpleGit
): Promise<void> {
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
  const rootUri = vscode.workspace.workspaceFolders![0].uri;

  const { panel, updateProps } = createWebView<FileSummaryPageProps>({
    title: "Uplift Code: File Summary",
    viewType: "upliftCode.fileSummary",
    context,
    template: "dist/file-summary.html",
  });

  updateProps({ currentFileName: activeFile, since: config.since });

  Promise.all([calculateProjectChurn(git), getFileCoupling(activeFile, git)]).then(
    ([churn, coupling]) => {
      const fileChurn = churn.get(activeFile) ?? 0;

      updateProps({
        currentFileChurn: fileChurn,
        coupling: Array.from(coupling.entries()).map(([file, count]) => ({
          file,
          ratio: ((count / fileChurn) * 100).toFixed(2),
          href: path.join(rootUri.fsPath, file),
        })),
      });
    }
  );

  calculateFileComplexityTrend(git, activeFile).then((complexity) => {
    updateProps({
      complexity: complexity.complexity,
      complexityItems: complexity.versions.reverse().map((version) => ({
        label: version.log.date.split("T")[0],
        value: version.complexity,
      })),
    });
  });

  return panel;
}

function renderProjectSummary(
  git: SimpleGit,
  context: vscode.ExtensionContext
): vscode.WebviewPanel {
  const config = getExtensionConfig();

  const { panel, updateProps } = createWebView<ProjectSummaryPageProps>({
    title: "Uplift Code: Project Summary",
    viewType: "upliftCode.projectSummary",
    context,
    template: "dist/project-summary.html",
  });

  calculateProjectSummaryData(git).then((data) => {
    updateProps({
      ...data,
      since: config.since,
    });
  });

  return panel;
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
