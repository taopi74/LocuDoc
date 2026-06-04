export const SSN_COL = 'Social Security Number';

export const COMPARE_COLS = [
  'Employee Number',
  'First Name',
  'Last Name',
  'Employee Status',
  'State Additional Withholding',
  'Federal Additional Withholding',
  'Federal Filing Status',
  'Federal Exemptions',
  'Federal Dependent Credit',
] as const;

export const REQUIRED_COLS = [SSN_COL, ...COMPARE_COLS] as const;

export type CompareCol = (typeof COMPARE_COLS)[number];
