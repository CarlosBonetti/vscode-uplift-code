import vscode from "vscode";

export interface ExtensionConfig {
  excludePatterns: string[];
  since: string;
}

export function getExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("codeInsights");

  return {
    since: config.get<string>("since", "12.month"),
    excludePatterns: [
      ...defaultExcludePatterns,
      ...config.get<string[]>("exclude", []),
    ],
  };
}

const defaultExcludePatterns = [
  "**/package.json",
  "**/package-lock.json",
  "**/poetry.lock",
];
