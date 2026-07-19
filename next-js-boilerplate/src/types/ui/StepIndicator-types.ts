export interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onChange?: (step: number) => void;
}
