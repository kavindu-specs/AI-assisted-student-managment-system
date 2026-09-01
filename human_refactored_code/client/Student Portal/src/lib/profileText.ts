// The real schema only gives the student-profile wizard a handful of flat
// text columns (family_info, emergency_contact, other_details) to work with,
// where the original mockup had several distinct labelled fields per step
// (father's name / mother's occupation / etc). Rather than dropping those
// fields, each wizard step compiles its own group of fields into one
// "Label: value" per line block for its column, and parses that same format
// back out when the form reloads - see PersonalDetailsForm.tsx,
// FamilyInformationForm.tsx and EmergencyContactForm.tsx.

export function formatKeyValueBlock(entries: Array<[string, string]>): string {
  return entries
    .filter(([, value]) => value.trim().length > 0)
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join('\n');
}

export function parseKeyValueBlock(text: string | null | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  (text ?? '').split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const label = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (label) result[label] = value;
  });
  return result;
}
