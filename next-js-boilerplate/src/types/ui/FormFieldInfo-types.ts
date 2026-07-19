export interface FormFieldInfoProps<TParentData> {
  field: { state: { meta: { errors: string[]; isValidating?: boolean } } };
}
