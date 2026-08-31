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

## Identity model — read this first

`USER_ACCOUNT` is the base identity/login table. `ADMIN_USER` and `STUDENT` are **subtypes that share its primary key** — `admin_user.admin_id` and `student.student_id` are *both* their own PK *and* a FK to `user_account.user_id`. Practically:

- A student's `student_id`, their `user_account.user_id`, and the `userId`/`studentId` claims in their JWT are always the same number.
- A `Student` row cannot exist without a `UserAccount` row — so **bulk import creates both at once** (account starts `Inactive` and unusable; approval activates it).
- There is no self-registration for admins — bootstrap one with `npm run create-admin -- <institutionalEmail> <staffNo> <designation> <password>`.

---

## Auth — `/api/auth`

### `POST /auth/student/login`
No auth required. Rate-limited (20 req / 15 min / IP).

Request:
```json
{ "regNumber": "AGRI-2026-0001", "password": "temp-or-real-password" }
```

Response — first-ever login (temp password still active, `student_account.login_completed = false`):
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
No auth required. Rate-limited. Email must end with the configured `ADMIN_EMAIL_DOMAIN` (default `agri.rjt.ac.lk`) and match an `ADMIN_USER.institutional_email`.

Request:
```json
{ "institutionalEmail": "registrar@agri.rjt.ac.lk", "password": "..." }
```

Response — OTP is **always** required for admins (no per-account toggle in this schema):
```json
{ "success": true, "data": { "requiresOtp": true, "preAuthToken": "<jwt>" }, "message": "Login successful" }
```
An email containing a 6-digit OTP (valid `OTP_TTL_MINUTES`, default 5) is sent to the account's email.

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
  "student": { "student_id": 1, "reg_number": "AGRI-2026-0001", "full_name": "...", "nic": "...", "account_status": "Active", "current_status": "Registered", "Programme": { "...": "...", "Faculty": { "...": "..." } }, "Intake": { "...": "..." } },
  "profile": { "profile_id": 1, "student_id": 1, "address": "...", "profile_completion_pct": 70.00, "...": "..." },
  "photo": { "photo_id": 1, "file_path": "...", "is_active": true } ,
  "signature": { "signature_id": 1, "file_path": "...", "is_active": true },
  "documents": [ { "document_id": 1, "doc_type": "NIC Copy", "is_verified": false, "...": "..." } ]
}
```
`photo`/`signature` are `null` until uploaded (only the currently-active one is returned — re-uploading deactivates the previous one).

### `PATCH /students/me/profile`
All fields optional — send only what changed.
```json
{
  "address": "...", "contact_no": "...", "email": "...", "date_of_birth": "2001-05-14",
  "gender": "Male", "family_info": "free text - parents/guardian details, occupation, etc.",
  "emergency_contact": "...", "other_details": "..."
}
```
Returns the updated `StudentProfile` row. `profile_completion_pct` is recomputed automatically after every save — see [Profile completion formula](#profile-completion-formula) below.

### `POST /students/me/photo`
`multipart/form-data`: file field `file` (jpg/png/pdf, ≤5MB). Deactivates any previous photo. Returns the created `ProfilePhotograph` row.

### `POST /students/me/signature`
Same shape, for the `Signature` table.

### `POST /students/me/documents`
`multipart/form-data`: file field `file` + text field `docType` — one of `NIC Copy`, `Birth Certificate`, `Admission Letter`, `Medical Certificate`, `School Certificate`, `Other`.

Returns the created `SupportingDocument` row (`is_verified: false` until an admin reviews it).

### `GET /students/me/photo/:photoId/file`
### `GET /students/me/signature/:signatureId/file`
### `GET /students/me/documents/:documentId/file`
Streams the raw file — only if it belongs to the calling student (404 otherwise). There is **no unauthenticated static file route**; this is the only way to fetch an uploaded file.

### `GET /students/me/courses/available?semesterId=<id>`
Requires `current_status = 'Registered'` (403 otherwise). The refined schema has no programme-course catalog, so this simply lists **every** `Course` row — there's nothing left to scope by programme or year.
```json
[{ "course_id": 12, "course_code": "AGRI201", "course_name": "...", "credits": 3, "is_elective": false }]
```

### `POST /students/me/courses/register`
```json
{ "semesterId": 3, "courseIds": [12, 15, 18, 20] }
```
Validates: no duplicate course IDs, all course IDs exist, total credits between `MIN_REGISTRATION_CREDITS` (15) and `MAX_REGISTRATION_CREDITS` (22). Re-submitting replaces the previous course list for that semester (unless it's already `Approved`, which returns `409`). Sets the registration to `Submitted`, pending admin decision. `is_compulsory`/`is_elective` on each item are copied from the course's own `is_elective` flag at selection time.

Returns the `CourseRegistration` with its `CourseRegistrationItems` (each including its `Course`).

---

## Admin — `/api/admin` (role: `admin`)

All routes require `Authorization: Bearer <admin access token>`.

### `GET /admin/students?status=&programmeId=`
`status` is one of `student.current_status`'s values (`Prospective`, `Registered`, `Graduated`, `Released`). Returns students with `Programme → Faculty` nested.

### `GET /admin/students/:studentId`
Single student, same includes as above.

### `POST /admin/students/approve`
### `POST /admin/students/reject`
```json
{ "studentIds": [4, 5, 6], "reason": "optional, used for rejection audit trail" }
```
Processes each ID independently — one failure doesn't stop the rest. Only students currently `Prospective` can be decided. Response is a per-student result array:
```json
[
  { "studentId": 4, "success": true, "data": { "student": { "...": "..." }, "account": { "...": "..." }, "tempPassword": "Xk92Ptn4Qb" } },
  { "studentId": 5, "success": false, "error": "Student is already Registered" }
]
```
**Approve**: `current_status` → `Registered`, `account_status` → `Active`, a fresh temporary password is generated and both emailed and returned once in `tempPassword` (for the admin's "send credentials"/CSV-export screen — never logged or persisted in plain text). **Reject**: `account_status` → `Suspended` (there's no dedicated "Rejected" enum value in this schema), `current_status` stays `Prospective`, reason goes to the audit log.

### `POST /admin/imports`
`multipart/form-data`: file field `file` (`.xlsx`/`.xls`/`.csv`, ≤10MB) + text fields `programmeId`, `intakeId`, `regulationId` — every student in the sheet is assigned to this one programme/intake/regulation.

Expected spreadsheet columns: `Full Name`, `NIC`, `DOB`, `Gender`, `Email`, `Phone`, `Address`.

Every row is validated; passing rows (`Valid` or `Warning`) get a full identity created immediately — `UserAccount` (Inactive) + `Student` (Prospective) + `StudentAccount` + `StudentProfile` — inside the same transaction as the `ImportBatch`. Rows with a hard error (missing name/NIC/DOB/gender, bad NIC format, duplicate NIC) create nothing. **The schema has no per-row import table**, so the row-level results below only ever exist in this one response — persist them client-side (e.g. router state) if the Validation Results screen needs to show them after navigating away.

```json
{
  "batch": { "batch_id": 7, "total_records": 50, "valid_records": 46, "invalid_records": 4, "status": "Completed" },
  "rows": [
    { "row_number": 1, "reg_number": "AGRI-2026-0001", "full_name": "...", "nic": "...", "validation_status": "Valid", "student_id": 101 },
    { "row_number": 2, "full_name": "...", "validation_status": "Error", "message": "NIC format is invalid", "student_id": null }
  ]
}
```

### `POST /admin/imports/:batchId/corrections`
Flags a whole batch for correction/redo — this is **batch-level**, not per-row (the schema doesn't model row-level corrections).
```json
{ "justification": "Rows 12-18 used the wrong intake code, please re-import" }
```

### `GET /admin/imports/:batchId/corrections`
Lists correction requests for a batch, newest first.

### `PATCH /admin/corrections/:correctionId`
```json
{ "status": "Approved" }
```
`status` is one of `Approved`, `Rejected`, `Completed`.

### `GET /admin/documents/:documentId/file`
### `GET /admin/photos/:photoId/file`
### `GET /admin/signatures/:signatureId/file`
Streams the raw file for any student (review before verifying). Only `SUPPORTING_DOCUMENT` has a verify endpoint — photos/signatures have no verification workflow in this schema (just `is_active`).

### `PATCH /admin/documents/:documentId/verify`
```json
{ "isVerified": true }
```
or
```json
{ "isVerified": false, "reason": "Blurry scan, please re-upload" }
```
`reason` is written to the audit log only (the table has no `rejection_reason` column).

### `POST /admin/course-registrations/approve`
### `POST /admin/course-registrations/reject`
```json
{ "registrationIds": [10, 11] }
```
Only registrations currently `Submitted` can be decided (`409` otherwise).

### `GET /admin/reports/summary?year=`
```json
{
  "summary": { "students": 1200, "registeredStudents": 980, "intakes": 3, "courseRegistrations": 890, "programmes": 12 },
  "facultyDistribution": [ { "faculty": "Faculty of Agriculture", "count": 640 } ],
  "monthlyCourseRegistrations": [ { "month": 1, "count": 34 } ]
}
```
`year` defaults to the current calendar year. `monthlyCourseRegistrations` counts `course_registration.registration_date` — the schema has no student-creation timestamp to report on directly.

---

## Misc

### `GET /api/health`
No auth. `{ "success": true, "message": "API is healthy" }` — for uptime checks.

---

## Profile completion formula

`student_profile.profile_completion_pct` is a `DECIMAL(5,2)` percentage, recomputed after every profile update or photo/signature/document upload. It's 10 equally-weighted checks (`(filled / 10) * 100`):

- 7 `StudentProfile` fields: `address`, `contact_no`, `email`, `date_of_birth`, `gender`, `family_info`, `emergency_contact`.
- Has an active photo.
- Has an active signature.
- Has at least one supporting document.

See `src/utils/profileCompletion.js` if the weighting needs to change.

## Known simplifications / schema gaps patched in (by design, not oversights)

- **`student.full_name`** and **`student.programme_id`/`intake_id`/`regulation_id`** were added on top of the refined diagram — the diagram had no column anywhere for a student's name, and left the whole faculty→programme→intake→regulation chain disconnected from `student`. Both were confirmed with the product owner before implementing.
- **Admin OTP** is hashed and stored in `otp_challenge` (one row per pending challenge, keyed by `user_id`, TTL `OTP_TTL_MINUTES`) — added on top of the refined diagram specifically so any worker in the clustered server (see `server.js`) can validate an OTP a different worker issued.
- **Login rate limiting** (`express-rate-limit` on `/auth/*/login`) still tracks counts in each worker process's own memory, so the effective limit is roughly `limit × CLUSTER_WORKERS` across the whole server, not a hard global cap. Acceptable for now; move to a shared store (e.g. `rate-limit-redis`) if that matters for your deployment.
- **Notifications** (`notificationService`) always write a `Notification` row; actual email delivery only happens if SMTP env vars are set (the schema has no `sent_at`/`channel` columns to track delivery state).
- **File storage** is local disk under `uploads/` (see `storageService.js`) behind a one-file interface — swap for S3/Cloudinary there when needed.
- **No course catalog**: `PROGRAMME_COURSE` was removed from the refined schema, so course registration can't be scoped by programme/year — every active course is offered to every eligible student.
- **No per-row import history**: `IMPORT_BATCH_RECORD` was removed; only aggregate counts persist on `IMPORT_BATCH`. `CORRECTION_REQUEST` is a batch-level flag, not a row-level fix-up mechanism.

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
