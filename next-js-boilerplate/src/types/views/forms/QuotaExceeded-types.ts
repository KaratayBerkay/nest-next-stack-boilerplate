export interface QuotaExceededProps {
  heading: string;
  quotaTitle: string;
  quotaBody: string;
  backLabel: string;
  onReset: () => void;
}
