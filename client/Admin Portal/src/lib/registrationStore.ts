export type ValidationStatus = 'Valid' | 'Warning' | 'Error';

export type ImportedStudent = {
  registration: string;
  name: string;
  nic: string;
  email: string;
  status: ValidationStatus;
  message: string;
};

const recordsKey = 'rms-import-records';
const configurationKey = 'rms-import-configuration';

export function saveImport(records: ImportedStudent[], configuration: Record<string, string>) {
  sessionStorage.setItem(recordsKey, JSON.stringify(records));
  sessionStorage.setItem(configurationKey, JSON.stringify(configuration));
}

export function getImportRecords(): ImportedStudent[] {
  try {
    return JSON.parse(sessionStorage.getItem(recordsKey) ?? '[]');
  } catch {
    return [];
  }
}

export function getImportConfiguration(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(configurationKey) ?? '{}');
  } catch {
    return {};
  }
}

export function hasValidationErrors() {
  return getImportRecords().some((record) => record.status === 'Error');
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
