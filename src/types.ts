export interface InsightsContext {
  fileChurnMap: Map<string, number>;
  loaded: boolean;
  maxChurn: number;
  avgChurn: number;
}

export interface ProjectSummaryData {
  items: {
    file: string;
    href: string;
    churn: number;
  }[];
}
