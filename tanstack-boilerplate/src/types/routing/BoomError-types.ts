export interface BoomErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
