import simpleGit from "simple-git";
import vscode from "vscode";
import { createProjectSummaryPanel } from "./summary";

export function activate(context: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders?.[0]) {
    return;
  }

  const git = simpleGit({
    baseDir: vscode.workspace.workspaceFolders[0].uri.path,
  });

  const showProjectSummary = () => {
    createProjectSummaryPanel(context, git);
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
}

export function deactivate() {}
