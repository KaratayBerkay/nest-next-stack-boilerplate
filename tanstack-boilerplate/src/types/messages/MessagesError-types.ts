export interface MessagesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
