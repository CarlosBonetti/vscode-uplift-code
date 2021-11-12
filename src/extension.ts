import simpleGit from "simple-git";
import vscode from "vscode";
import { calculateProjectChurn } from "./churn";
import { createProjectSummaryPanel } from "./summary";
import { InsightsContext } from "./types";

export function activate(context: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders?.[0]) {
    return;
  }

  const insightsContext: InsightsContext = {
    fileChurnMap: new Map<string, number>(),
    maxChurn: 0,
    avgChurn: 0,
    loaded: false,
  };

  const git = simpleGit({
    baseDir: vscode.workspace.workspaceFolders[0].uri.path,
  });

  const showProjectSummary = () => {
    createProjectSummaryPanel(context, git, insightsContext);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "upliftCode.showProjectSummary",
      showProjectSummary
    )
  );

  const upliftStatusBarButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  upliftStatusBarButton.command = "upliftCode.showProjectSummary";
  upliftStatusBarButton.text = "$(preview) Uplift";
  upliftStatusBarButton.show();
  context.subscriptions.push(upliftStatusBarButton);

  calculateProjectChurn(git).then((map) => {
    const maxChurn = Math.max(...map.values());
    const avgChurn =
      [...map.values()].reduce((total, curr) => total + curr, 0) / map.size;

    insightsContext.fileChurnMap = map;
    insightsContext.maxChurn = maxChurn;
    insightsContext.avgChurn = avgChurn;
    insightsContext.loaded = true;
  });
}

export function deactivate() {}
