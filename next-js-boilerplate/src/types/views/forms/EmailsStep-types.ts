export interface EmailsStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  t: Record<string, unknown>;
  emailInputError: string | null;
  setEmailInputError: (error: string | null) => void;
}
