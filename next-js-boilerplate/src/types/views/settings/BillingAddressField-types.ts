export interface BillingAddressFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  spanCol2?: boolean;
}
