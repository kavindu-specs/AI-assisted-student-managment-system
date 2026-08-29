# Rajarata University SMS — API Reference

Base URL: `http://localhost:4000/api` (see `.env` → `PORT`)

## Conventions

**Response envelope.** Every response is JSON:

```jsonc
// success
{ "success": true, "message": "...", "data": { /* or [] */ } }

// failure
{ "success": false, "message": "...", "errors": null /* or an array of field errors */ }
```

**Auth header.** Protected routes require:

```
Authorization: Bearer <token>
```

Tokens come in two flavors:
- **Access token** — issued after a full login (or after OTP/first-login completes). Carries `{ userId, role, studentId? }`. Required for all `/students/*` and `/admin/*` routes.
- **Pre-auth token** — issued mid-login (waiting on OTP or a forced password reset). Only accepted by the specific follow-up endpoint it was issued for (`step: 'otp'` or `step: 'first-login'`). Cannot access any other route.

**Roles.** `student` and `admin`, enforced per-route via `requireRole(...)`. A student token cannot call `/admin/*` and vice versa.

**Errors.** HTTP status carries the meaning:

| Status | Meaning |
|---|---|
| 400 | Bad request / invalid route param |
| 401 | Missing, invalid, or expired token; bad credentials |
| 403 | Authenticated but not allowed to do this |
| 404 | Resource not found |
| 409 | Conflict with current state (e.g. already approved) |
| 422 | Body/query failed validation |
| 500 | Unexpected server error |

**Validation.** Body/query is checked with [Zod](https://zod.dev) schemas (`src/validators/`). A 422 response's `errors` array looks like:

```json
[{ "path": "email", "message": "A valid email is required" }]
```

---

## Auth — `/api/auth`

### `POST /auth/student/login`
No auth required. Rate-limited (20 req / 15 min / IP).

Request:
```json
{ "registrationNo": "AG/2026/0081", "password": "temp-or-real-password" }
```

Response — first-ever login (temp password still active):
```json
{ "success": true, "data": { "requiresFirstLogin": true, "preAuthToken": "<jwt>" }, "message": "Login successful" }
```

Response — normal login:
```json
{ "success": true, "data": { "requiresFirstLogin": false, "token": "<jwt>", "student": { /* Student row */ } }, "message": "Login successful" }
```

### `POST /auth/student/first-login`
Requires the `preAuthToken` from above (`step: "first-login"`).

Request:
```json
{ "newPassword": "at-least-8-chars", "confirmPassword": "at-least-8-chars" }
```

Response:
```json
{ "success": true, "data": { "token": "<jwt>" }, "message": "Password updated" }
```

### `POST /auth/admin/login`
No auth required. Rate-limited. Email must end with the configured `ADMIN_EMAIL_DOMAIN` (default `agri.rjt.ac.lk`).

Request:
```json
{ "email": "registrar@agri.rjt.ac.lk", "password": "..." }
```

Response — 2FA enabled on the account (default for admins):
```json
{ "success": true, "data": { "requiresOtp": true, "preAuthToken": "<jwt>" }, "message": "Login successful" }
```
An email containing a 6-digit OTP (valid `OTP_TTL_MINUTES`, default 5) is sent to the account's email.

Response — 2FA disabled:
```json
{ "success": true, "data": { "requiresOtp": false, "token": "<jwt>" }, "message": "Login successful" }
```

### `POST /auth/admin/verify-otp`
Requires the `preAuthToken` from admin login (`step: "otp"`).

Request:
```json
{ "otp": "123456" }
```

Response:
```json
{ "success": true, "data": { "token": "<jwt>" }, "message": "Verification successful" }
```

### `GET /auth/me`
Requires a full access token (student or admin). Returns the decoded JWT payload — a cheap way for a client to check "am I still logged in, and as whom".

---

## Student self-service — `/api/students` (role: `student`)

All routes below require `Authorization: Bearer <student access token>` and always act on **the calling student** (`req.user.studentId`) — there is no `:studentId` param on this router.

### `GET /students/me/profile`
Full profile snapshot:
```json
{
  "student": { "student_id": 1, "registration_no": "AG/2026/0081", "full_name": "...", "student_status": "Active", "Programme": { "...": "...", "Department": { "...": "...", "Faculty": { "...": "..." } } }, "Intake": { "...": "..." } },
  "profile": { "profile_id": 1, "student_id": 1, "address_line_1": "...", "profile_completion_status": "In Progress", "...": "..." },
  "media": [ { "media_id": 1, "media_type": "Profile Photo", "verification_status": "Pending", "...": "..." } ],
  "documents": [ { "document_id": 1, "document_type": "NIC Copy", "verification_status": "Pending", "...": "..." } ]
}
```
`media` only includes rows where `is_current = true` (re-uploading a photo/signature supersedes the old one).

### `PATCH /students/me/personal-details`
All fields optional — send only what changed.
```json
{ "full_name": "...", "name_with_initials": "...", "date_of_birth": "2001-05-14", "gender": "Male" }
```
Returns the updated `Student` row.

### `PATCH /students/me/contact-family`
All fields optional.
```json
{
  "address_line_1": "...", "address_line_2": "...", "district": "...", "gs_division": "...", "electorate": "...",
  "mobile_phone": "...", "land_phone": "...", "email": "...",
  "guardian_name": "...", "guardian_relationship": "...", "guardian_phone": "...",
  "emergency_contact": "..."
}
```
Returns the updated `StudentProfile` row. `profile_completion_status` (`Not Started` / `In Progress` / `Completed`) is recomputed automatically after every save — see [Profile completion heuristic](#profile-completion-heuristic) below.

### `POST /students/me/documents`
`multipart/form-data`: file field `file` (jpg/png/pdf, ≤5MB) + text field `documentType` — one of `NIC Copy`, `Birth Certificate`, `Admission Letter`, `Medical Certificate`, `School Certificate`, `Other`.

Returns the created `StudentDocument` row (`verification_status: "Pending"` until an admin reviews it).

### `POST /students/me/media`
`multipart/form-data`: file field `file` (jpg/png/pdf, ≤5MB) + text field `mediaType` — `Profile Photo` or `Signature`.

Uploading a new file of the same `mediaType` automatically marks the previous one `is_current: false`. Returns the created `StudentMedia` row.

### `GET /students/me/documents/:documentId/file`
### `GET /students/me/media/:mediaId/file`
Streams the raw file — only if it belongs to the calling student (404 otherwise). There is **no unauthenticated static file route**; this is the only way to fetch an uploaded document/photo.

### `GET /students/me/courses/available?semesterId=<id>`
Lists the courses offered to this student for the given semester, filtered by their programme **and** their current study year. Requires the student to already be activated for that semester (see [`POST /admin/semester-registrations/activate`](#post-adminsemester-registrationsactivate)) — otherwise `403`.

```json
[
  { "course": { "course_id": 12, "course_code": "AGRI201", "course_name": "...", "credits": 3 }, "course_type": "Compulsory", "is_compulsory": true, "recommended_year": 2 }
]
```

### `POST /students/me/courses/register`
```json
{ "semesterId": 3, "courseIds": [12, 15, 18, 20] }
```
Validates: courses must be offered for this student/semester, no duplicates, total credits between `MIN_REGISTRATION_CREDITS` (15) and `MAX_REGISTRATION_CREDITS` (22). Re-submitting replaces the previous course list for that semester (unless it's already `Approved`, which returns `409`). Sets the registration to `Submitted`, pending admin decision.

Returns the `CourseRegistration` with its `CourseRegistrationItems` (each including its `Course`).

---

## Admin — `/api/admin` (role: `admin`)

All routes require `Authorization: Bearer <admin access token>`.

### `GET /admin/students?status=&programmeId=`
Both query params optional. `status` is one of the `student_status` enum values (`Pending`, `Approved`, `Rejected`, `Active`, `Suspended`, `Graduated`, `Withdrawn`). Returns students newest-first, each with `Programme → Department → Faculty` nested.

### `GET /admin/students/:studentId`
Single student, same includes as above.

### `POST /admin/students/approve`
### `POST /admin/students/reject`
```json
{ "studentIds": [4, 5, 6], "reason": "optional, used for rejection audit trail" }
```
Processes each ID independently — one failure doesn't stop the rest. Response is a per-student result array:
```json
[
  { "studentId": 4, "success": true, "data": { "student": { "...": "..." }, "account": { "...": "..." } } },
  { "studentId": 5, "success": false, "error": "Student is already Approved" }
]
```
**Approve** generates the registration number (`<FACULTY_CODE>/<ADMISSION_YEAR>/<seq>`), creates the `UserAccount` (username = registration number without slashes, a temporary password valid until first login, role `student`), and emails the credentials (via `notificationService` — logged only if SMTP isn't configured). **Reject** just flips `student_status` to `Rejected` with an audit entry.

### `POST /admin/imports`
`multipart/form-data`: file field `file` (`.xlsx`/`.xls`/`.csv`, ≤10MB) + text fields `intakeId`, `regulationId`, `programmeId`.

Expected spreadsheet columns: `Full Name`, `NIC`, `DOB`, `Gender`, `Email`, `Phone`, `Address`, `O/L Index No.`.

Every row is validated and — if it passes (or only carries a non-fatal warning, e.g. missing index no.) — a real `Student` row is created immediately, in the same DB transaction as the `ImportBatch`/`ImportBatchRecord` audit trail. Rows with a hard error (missing name/NIC/DOB/gender, bad NIC format, duplicate NIC) are recorded but no student is created.

```json
{
  "batch": { "import_batch_id": 7, "total_records": 50, "successful_records": 46, "failed_records": 4, "status": "Completed" },
  "records": [
    { "row_number": 1, "student_name": "...", "nic_no": "...", "validation_status": "Valid", "student_id": 101 },
    { "row_number": 2, "student_name": "...", "validation_status": "Error", "error_message": "NIC format is invalid", "student_id": null }
  ]
}
```

### `GET /admin/imports/:batchId`
Same `{ batch, records }` shape, for reviewing a past import.

### `GET /admin/documents/:documentId/file`
### `GET /admin/media/:mediaId/file`
Streams the raw file for any student (used to review before verifying).

### `PATCH /admin/documents/:documentId/verify`
### `PATCH /admin/media/:mediaId/verify`
```json
{ "status": "Verified" }
```
or
```json
{ "status": "Rejected", "rejectionReason": "Photo is blurry, please re-upload" }
```

### `POST /admin/semester-registrations/activate`
```json
{ "studentIds": [4, 5, 6], "semesterId": 3, "studyYear": 2 }
```
Marks each student `Registered` for that semester (creates the row if missing, updates it if not already registered) — this is the gate that `GET /students/me/courses/available` checks.

### `POST /admin/course-registrations/approve`
### `POST /admin/course-registrations/reject`
```json
{ "courseRegistrationIds": [10, 11] }
```
Only registrations currently `Submitted` can be decided (`409` otherwise).

### `GET /admin/reports/summary?year=`
```json
{
  "summary": { "students": 1200, "activeIntakes": 3, "courseRegistrations": 890, "activeProgrammes": 12 },
  "departmentDistribution": [ { "department": "Crop Science", "count": 210 } ],
  "monthlyRegistrations": [ { "month": 1, "count": 34 } ]
}
```
`year` defaults to the current calendar year; `monthlyRegistrations` counts by `student.registration_date`.

---

## Misc

### `GET /api/health`
No auth. `{ "success": true, "message": "API is healthy" }` — for uptime checks.

---

## Profile completion heuristic

`student_profile.profile_completion_status` is recomputed on every contact/family update and document upload:

- **Completed** — address + district + mobile phone **and** guardian name + guardian phone **and** emergency contact **and** at least one uploaded document.
- **In Progress** — any one of the above groups is filled in.
- **Not Started** — none of the above.

This is a pragmatic stand-in for the 5-step wizard shown in the Student Portal mockup; adjust the thresholds in `studentService.computeCompletionStatus` if the actual completion rules differ.

## Known simplifications (by design, not oversights)

- **Admin OTP** is generated and hashed in-process memory (not a DB table — the schema has none), TTL `OTP_TTL_MINUTES`. Fine for a single-process deployment; move to Redis before scaling to multiple instances.
- **Notifications** (`notificationService`) always write a `Notification` row; actual delivery only happens if SMTP env vars are set — otherwise it's logged and the row's `sent_at` stays `null`. Wire a real provider before relying on it in production.
- **File storage** is local disk under `uploads/` (see `storageService.js`) behind a one-file interface — swap for S3/Cloudinary there when needed.
- **Course prerequisites** aren't modelled (the schema doesn't have a prerequisite column/table) — only credit-range, duplicate, and offering/year checks are enforced.

## Auth quick-reference (all routes)

| Route | Auth | Role |
|---|---|---|
| `POST /auth/student/login` | none | — |
| `POST /auth/student/first-login` | pre-auth token | — |
| `POST /auth/admin/login` | none | — |
| `POST /auth/admin/verify-otp` | pre-auth token | — |
| `GET /auth/me` | access token | any |
| `/students/*` | access token | `student` |
| `/admin/*` | access token | `admin` |
| `GET /health` | none | — |
