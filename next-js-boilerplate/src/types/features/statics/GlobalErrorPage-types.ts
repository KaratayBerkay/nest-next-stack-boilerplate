export interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}
