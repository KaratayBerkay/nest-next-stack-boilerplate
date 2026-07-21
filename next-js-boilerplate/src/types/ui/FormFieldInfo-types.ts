export interface FormFieldInfoProps {
  field: {
    state: {
      meta: {
        errors: Array<string | { message?: string }>;
        isValidating?: boolean;
      };
    };
  };
  hint?: string;
}
