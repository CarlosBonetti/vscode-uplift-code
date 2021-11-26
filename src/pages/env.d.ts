declare function acquireVsCodeApi(): VSCode;

declare interface VSCode {
  postMessage(message: unknown): void;
}
