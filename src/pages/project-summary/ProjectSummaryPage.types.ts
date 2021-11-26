export interface ProjectSummaryPageProps {
  since: string;
  items: {
    file: string;
    href: string;
    churn: number;
  }[];
}
