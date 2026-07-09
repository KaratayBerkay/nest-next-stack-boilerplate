export interface V1ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
