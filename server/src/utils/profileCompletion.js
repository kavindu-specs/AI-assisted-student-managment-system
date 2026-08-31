const PROFILE_FIELDS = ['address', 'contact_no', 'email', 'date_of_birth', 'gender', 'family_info', 'emergency_contact'];
const TOTAL_CHECKS = PROFILE_FIELDS.length + 3; // + has photo + has signature + has a document

/**
 * 10 equally-weighted checks: the 7 STUDENT_PROFILE fields above, plus
 * whether a photo/signature/at-least-one-document has been uploaded.
 */
function calculateCompletionPct(profile, { hasPhoto = false, hasSignature = false, hasDocument = false } = {}) {
  let filled = PROFILE_FIELDS.filter((field) => Boolean(profile?.[field])).length;
  if (hasPhoto) filled += 1;
  if (hasSignature) filled += 1;
  if (hasDocument) filled += 1;

  return Math.round((filled / TOTAL_CHECKS) * 100 * 100) / 100;
}

module.exports = { calculateCompletionPct };
