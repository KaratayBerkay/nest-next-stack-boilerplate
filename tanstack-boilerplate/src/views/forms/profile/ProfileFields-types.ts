export interface ProfileFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  fieldSchemas: Record<string, unknown>;
  usernameAvailable: boolean;
  setUsernameAvailable: (v: boolean) => void;
  t: Record<string, unknown>;
  checkUsername: (v: string) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateError: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any;
  allMessages: Record<string, unknown>;
}
