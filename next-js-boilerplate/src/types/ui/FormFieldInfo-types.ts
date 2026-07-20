export interface FormFieldInfoProps {
  field: { state: { meta: { errors: string[]; isValidating?: boolean } } };
  hint?: string;
}
