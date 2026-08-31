export interface ComplianceMessages {
  [key: string]: string;
}

export interface PagesWithComplianceMessages {
  compliance: ComplianceMessages;
}
