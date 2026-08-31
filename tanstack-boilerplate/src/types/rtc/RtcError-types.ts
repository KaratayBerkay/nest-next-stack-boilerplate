export interface RtcErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
