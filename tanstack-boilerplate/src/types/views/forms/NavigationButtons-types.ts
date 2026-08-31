export interface NavigationButtonsProps {
  step: number;
  setStep: (updater: (prev: number) => number) => void;
  canNext: boolean;
  setEmailInputError: (error: string | null) => void;
  t: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}
