export interface FileSummaryPageProps {
  since: string;
  currentFileName: string;
  currentFileChurn: number;
  complexity: number;
  complexityItems: {
    value: number;
    label: string;
  }[];
  coupling: {
    file: string;
    href: string;
    ratio: string;
  }[];
}
