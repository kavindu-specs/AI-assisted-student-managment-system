// sessionStorage-backed router-state substitute: passes data between routes
// in the import -> validate -> approve -> account-creation workflow without a
// global store. The backend has no per-row import table and no endpoint that
// can re-fetch a batch's row-level results or an approval's one-time temp
// password later (see server/docs/API.md "Known simplifications"), so both
// responses are persisted here immediately after the request that produced
// them and read back by the next screen in the flow.

export type ValidationStatus = 'Valid' | 'Warning' | 'Error';

export type ImportBatch = {
  batch_id: number;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  status: string;
};

export type ImportRow = {
  row_number: number;
  reg_number: string | null;
  full_name: string | null;
  nic: string | null;
  validation_status: ValidationStatus;
  message: string | null;
  student_id: number | null;
};

export type ImportApiResult = {
  batch: ImportBatch;
  rows: ImportRow[];
};

export type ApprovalAccountData = {
  student: {
    student_id: number;
    reg_number: string;
    full_name: string;
    nic: string;
    [key: string]: unknown;
  };
  account: {
    user_id: number;
    username: string;
    email: string;
    status: string;
    [key: string]: unknown;
  };
  tempPassword: string;
};

export type ApprovalResult = {
  studentId: number;
  success: boolean;
  data?: ApprovalAccountData;
  error?: string;
};

const importResultKey = 'rms-import-result';
const approvalResultsKey = 'rms-approval-results';
const configurationKey = 'rms-import-configuration';

export function saveImportResult(result: ImportApiResult) {
  sessionStorage.setItem(importResultKey, JSON.stringify(result));
}

export function getImportResult(): ImportApiResult | null {
  try {
    const raw = sessionStorage.getItem(importResultKey);
    return raw ? (JSON.parse(raw) as ImportApiResult) : null;
  } catch {
    return null;
  }
}

export function hasValidationErrors(): boolean {
  return (getImportResult()?.rows ?? []).some((row) => row.validation_status === 'Error');
}

export function saveApprovalResults(results: ApprovalResult[]) {
  sessionStorage.setItem(approvalResultsKey, JSON.stringify(results));
}

export function getApprovalResults(): ApprovalResult[] {
  try {
    const raw = sessionStorage.getItem(approvalResultsKey);
    return raw ? (JSON.parse(raw) as ApprovalResult[]) : [];
  } catch {
    return [];
  }
}

// Legacy generic helpers, still used by SemesterRegistrationPage (a
// prototype-only step with no backing API endpoint - out of scope for this
// integration pass). Kept as-is so that page keeps working unchanged.
export function getImportConfiguration(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(configurationKey) ?? '{}');
  } catch {
    return {};
  }
}

export function setWorkflowValue(key: string, value: unknown) {
  sessionStorage.setItem(`rms-${key}`, JSON.stringify(value));
}

export function getWorkflowValue<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(sessionStorage.getItem(`rms-${key}`) ?? '') as T;
  } catch {
    return fallback;
  }
}
