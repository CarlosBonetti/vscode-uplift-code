const vscode = acquireVsCodeApi();

export function useVsCodeApi(): VSCode {
  return vscode;
}
