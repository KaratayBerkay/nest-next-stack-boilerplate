import type { ReactNode } from "react";

type FormLevelErrorState = { errorMap: { onSubmit?: unknown } };

export interface FormLevelErrorProps {
  form: {
    Subscribe: (props: {
      selector: (state: FormLevelErrorState) => unknown;
      children: (error: unknown) => ReactNode;
    }) => ReactNode | Promise<ReactNode>;
    setErrorMap: (errorMap: { onSubmit: undefined }) => void;
  };
}
