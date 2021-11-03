import * as vscode from "vscode";

import simpleGit, { SimpleGit } from "simple-git";
import {
  calculateChurnScore,
  calculateFileChurn,
  calculateProjectChurn,
  getTopRankedChurnFiles,
} from "./churn";
import { createProjectSummaryPanel } from "./summary/summary";
import { InsightsContext } from "./types";

export function activate(context: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders?.[0]) {
    return;
  }

  const insightsContext: InsightsContext = {
    fileChurnMap: new Map<string, number>(),
    maxChurn: 0,
    avgChurn: 10,
  };

  const git = simpleGit({
    baseDir: vscode.workspace.workspaceFolders[0].uri.path,
  });

  const showProjectSummary = () => {
    createProjectSummaryPanel(context, insightsContext);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codeInsights.showProjectSummary",
      showProjectSummary
    )
  );

  const churnStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  churnStatusBarItem.command = "codeInsights.showProjectSummary";
  context.subscriptions.push(churnStatusBarItem);
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() =>
      updateStatusBarItem(churnStatusBarItem, git, insightsContext)
    )
  );
  updateStatusBarItem(churnStatusBarItem, git, insightsContext);

  calculateProjectChurn(git).then((map) => {
    const maxChurn = Math.max(...map.values());
    const avgChurn =
      [...map.values()].reduce((total, curr) => total + curr, 0) / map.size;

    insightsContext.fileChurnMap = map;
    insightsContext.maxChurn = maxChurn;
    insightsContext.avgChurn = avgChurn;

    updateStatusBarItem(churnStatusBarItem, git, insightsContext);
  });
}

export function deactivate() {}

function updateStatusBarItem(
  statusBarItem: vscode.StatusBarItem,
  git: SimpleGit,
  insightsContext: InsightsContext
): void {
  const textEditor = vscode.window.activeTextEditor;

  if (!textEditor) {
    statusBarItem.hide();
    return;
  }

  statusBarItem.text = `$(loading~spin) Churn: -`;
  statusBarItem.show();

  calculateFileChurn(git, textEditor.document.fileName).then((churn) => {
    statusBarItem.text = `$(preview) Churn: ${churn}`;

    // const { avgChurn, maxChurn, fileChurnMap } = insightsContext;
    // const score = calculateChurnScore(churn, avgChurn, maxChurn);

    // console.log({
    //   churn,
    //   score,
    //   scoreMaxChurn: calculateChurnScore(maxChurn, avgChurn, maxChurn),
    //   scoreAvgChurn: calculateChurnScore(avgChurn, avgChurn, maxChurn),
    //   scoreMinChurn1: calculateChurnScore(1, avgChurn, maxChurn),
    //   insightsContext,
    // });

    // const formatter = new Intl.NumberFormat("en", {
    //   // TODO: get user's locale
    //   minimumFractionDigits: 1,
    //   maximumFractionDigits: 1,
    // });

    // statusBarItem.text = `$(preview) Churn: ${churn} | Score: ${formatter.format(
    //   score * 10
    // )}`;
  });
}
