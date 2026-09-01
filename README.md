# AI-assisted-student-managment-system

## Human Refactoring Changes

The following refinements are currently applied to the AI-generated code in
the working tree, primarily under `human_refactored_code/server`.

### 1. API/Database Model Refinement

- Aligned Sequelize entities with the final EER and SQL schema.
- Added missing student, account, profile, academic, and registration fields.
- Corrected constraints, defaults, status values, and table mappings.
- Added the required relationships

### 2. API/Authentication Refinement

- Refined student and administrator login flows to match the prototype.
- Added strict request validation for login, first-login, and OTP requests.
- Separated pre-authentication tokens from full access tokens.
- Added first-login password completion and administrator OTP verification rules.
- Preserved secure password hashing and generic authentication error responses.

### 3. API/Role-Based Access Control Refinement

- Protected authenticated endpoints with Bearer-token authentication.
- Enforced administrator-only access to administration routes.
- Enforced student-only access to student self-service routes.
- Rejected pre-authentication tokens on normal protected routes.

### 4. API/Student Import Refinement

- Processes spreadsheet student imports rather than basic student CRUD.
- Validates each row for required fields, NIC format, duplicate NICs, dates, and
  gender values.
- Processes large uploads in fixed-size transactional chunks to reduce memory
  usage.
- Creates the required user, student, account, and profile records for valid
  rows while returning row-level validation results.
- Tracks aggregate valid and invalid records through the import batch.

### 5. API/Validation Logic Refinement

- Removed validation rules that did not match the prototype scope.
- Added focused Zod schemas for authentication, administration, profile,
	document, and course-registration requests.
- Added positive-integer, required-field, enum, array, and conditional-field
	validation where appropriate.
- Standardized validation errors before requests reach the service layer.

### 6. API/Semester Registration Refinement

- Added student eligibility checks based on the academic account lifecycle.
- Requires students to be in the `Registered` status before course registration.
- Validates that the requested semester exists.
- Added draft, submitted, approved, and rejected registration states.
- Prevents modification of an already approved semester registration.

### 7. API/Course Registration Refinement

- Validates positive course IDs and rejects duplicate course selections.
- Confirms that all selected courses exist.
- Enforces the 15 to 22 credit registration range.
- Replaces previous unapproved course selections atomically for the semester.
- Supports administrator approval and rejection of submitted registrations with
	audit logging.

### 8. API Documentation Refinement

- Corrected the OpenAPI endpoints, parameters, payloads, responses, and status
	codes to match the implementation.
- Added realistic request and response examples.
- Documented authentication, role restrictions, validation errors, course
	registration rules, and schema limitations.
- Added positive and unique identifier constraints to the OpenAPI schemas.

### 9. Multiprocessing / Cluster Refinement

- Runs one HTTP server and Sequelize connection pool per worker process.
- Starts the configured number of workers when clustering is enabled.
- Restarts crashed workers with a short backoff.
- Supports graceful `SIGINT` and `SIGTERM` shutdown for the primary process and
	workers.
- Closes the HTTP server and database connection pool before a worker exits.
- Handles HTTP listen errors and prevents duplicate shutdown handling.
- Supports `CLUSTER_ENABLED`, `CLUSTER_WORKERS`, and `DB_POOL_MAX` settings.

### 10. Server Logging and Debugging Refinement

- Provides centralized timestamped logging through the project logger.
- Includes the process ID in log entries for clustered-worker diagnosis.
- Supports configurable `LOG_LEVEL` filtering (`error`, `warn`, `info`, or
	`debug`).
- Routes Morgan HTTP access logs through the centralized logger.
- Records uncaught exceptions and unhandled promise rejections before exiting.
- Keeps unexpected API errors recorded through the error handler.

### Changed Files

- `human_refactored_code/server/server.js`
- `human_refactored_code/server/src/app.js`
- `human_refactored_code/server/src/config/env.js`
- `human_refactored_code/server/src/utils/logger.js`
- `human_refactored_code/server/.env.example`
- `human_refactored_code/server/src/middleware/authMiddleware.js`
- `human_refactored_code/server/src/models/Student.js`
- `human_refactored_code/server/src/models/StudentAccount.js`
- `human_refactored_code/server/src/models/StudentProfile.js`
- `human_refactored_code/server/src/models/index.js`
- `human_refactored_code/server/src/services/bulkImportService.js`
- `human_refactored_code/server/src/services/courseRegistrationService.js`
- `human_refactored_code/server/src/validators/studentValidators.js`
- `human_refactored_code/server/tests/services/bulkImportService.test.js`
- `human_refactored_code/server/tests/services/courseRegistrationService.test.js`
- `server/docs/openapi.yaml`
