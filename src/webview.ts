import vscode from "vscode";
import { readFileSync } from "fs";
import path from "path";

export interface WebViewResult<P> {
  panel: vscode.WebviewPanel;
  updateProps: (props: Partial<P>) => void;
}

export interface WebViewConfig {
  context: vscode.ExtensionContext;
  template: string;
  title: string;
  viewType: string;
}

export function createWebView<P>(config: WebViewConfig): WebViewResult<P> {
  const { context, template, title, viewType } = config;
  const panel = vscode.window.createWebviewPanel(viewType, title, vscode.ViewColumn.Active, {
    enableScripts: true,
  });

  panel.webview.html = renderTemplate(context, template);

  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "open-file":
        vscode.window.showTextDocument(vscode.Uri.file(message.href)).then(
          () => null,
          () => vscode.window.showInformationMessage("File not found on disk")
        );
        break;
    }
  });

  return {
    panel,
    updateProps: (props) => updateProps(panel, props),
  };
}

export function renderTemplate(context: vscode.ExtensionContext, templatePath: string): string {
  const templateFilePath = vscode.Uri.file(path.join(context.extensionPath, templatePath));
  const template = readFileSync(templateFilePath.fsPath);
  return template.toString();
}

export function updateProps(panel: vscode.WebviewPanel, props: unknown): void {
  panel.webview.postMessage({
    type: "props-change",
    payload: props,
  });
}
