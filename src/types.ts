export interface InsightsContext {
  fileChurnMap: Map<string, number>;
  loaded: boolean;
  maxChurn: number;
  avgChurn: number;
}
