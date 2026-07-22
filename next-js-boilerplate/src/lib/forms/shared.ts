import type { FormEvent } from "react";

interface SubmitHandler {
  handleSubmit: () => void;
}

export function createFormSubmitHandler(form: SubmitHandler) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };
}
