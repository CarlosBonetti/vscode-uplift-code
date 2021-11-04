import vscode from "vscode";

export interface ExtensionConfig {
  excludePatterns: string[];
}

export function getExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("codeInsights");

  return {
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
