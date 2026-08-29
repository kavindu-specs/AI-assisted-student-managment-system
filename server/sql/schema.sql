-- Rajarata University Student Management System
-- Full relational schema, transcribed from the approved EER diagram / schema mapping.
-- MySQL 8.0+. InnoDB, utf8mb4.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS rajarata_sms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rajarata_sms;

-- 1. FACULTY
CREATE TABLE IF NOT EXISTS faculty (
  faculty_id    INT AUTO_INCREMENT PRIMARY KEY,
  faculty_code  VARCHAR(20) NOT NULL,
  faculty_name  VARCHAR(150) NOT NULL,
  UNIQUE KEY uq_faculty_code (faculty_code)
) ENGINE=InnoDB;

-- 2. DEPARTMENT
CREATE TABLE IF NOT EXISTS department (
  department_id   INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id      INT NOT NULL,
  department_code VARCHAR(20) NOT NULL,
  department_name VARCHAR(150) NOT NULL,
  UNIQUE KEY uq_department_code (department_code),
  CONSTRAINT fk_department_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
) ENGINE=InnoDB;

-- 3. PROGRAMME
CREATE TABLE IF NOT EXISTS programme (
  programme_id   INT AUTO_INCREMENT PRIMARY KEY,
  department_id  INT NOT NULL,
  programme_code VARCHAR(20) NOT NULL,
  programme_name VARCHAR(150) NOT NULL,
  programme_type VARCHAR(50) NOT NULL,
  duration_years TINYINT NOT NULL,
  status         ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  UNIQUE KEY uq_programme_code (programme_code),
  CONSTRAINT fk_programme_department FOREIGN KEY (department_id) REFERENCES department(department_id)
) ENGINE=InnoDB;

-- 4. INTAKE
CREATE TABLE IF NOT EXISTS intake (
  intake_id      INT AUTO_INCREMENT PRIMARY KEY,
  intake_name    VARCHAR(100) NOT NULL,
  admission_year YEAR NOT NULL,
  start_date     DATE NOT NULL,
  status         ENUM('Active','Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB;

-- 5. ACADEMIC_REGULATION
CREATE TABLE IF NOT EXISTS academic_regulation (
  regulation_id   INT AUTO_INCREMENT PRIMARY KEY,
  regulation_code VARCHAR(20) NOT NULL,
  regulation_name VARCHAR(150) NOT NULL,
  effective_from  DATE NOT NULL,
  effective_to    DATE NULL,
  status          ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  UNIQUE KEY uq_regulation_code (regulation_code)
) ENGINE=InnoDB;

-- 6. STUDENT
CREATE TABLE IF NOT EXISTS student (
  student_id       INT AUTO_INCREMENT PRIMARY KEY,
  registration_no  VARCHAR(30) NULL,
  index_no         VARCHAR(30) NULL,
  nic_no           VARCHAR(20) NOT NULL,
  full_name        VARCHAR(150) NOT NULL,
  name_with_initials VARCHAR(150) NOT NULL,
  date_of_birth    DATE NOT NULL,
  gender           ENUM('Male','Female','Other') NOT NULL,
  registration_date DATE NULL,
  student_status   ENUM('Pending','Approved','Rejected','Active','Suspended','Graduated','Withdrawn') NOT NULL DEFAULT 'Pending',
  programme_id     INT NOT NULL,
  intake_id        INT NOT NULL,
  regulation_id    INT NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_registration_no (registration_no),
  UNIQUE KEY uq_student_index_no (index_no),
  UNIQUE KEY uq_student_nic_no (nic_no),
  CONSTRAINT fk_student_programme  FOREIGN KEY (programme_id) REFERENCES programme(programme_id),
  CONSTRAINT fk_student_intake     FOREIGN KEY (intake_id) REFERENCES intake(intake_id),
  CONSTRAINT fk_student_regulation FOREIGN KEY (regulation_id) REFERENCES academic_regulation(regulation_id)
) ENGINE=InnoDB;

-- 7. STUDENT_PROFILE
CREATE TABLE IF NOT EXISTS student_profile (
  profile_id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id          INT NOT NULL,
  address_line_1      VARCHAR(150) NULL,
  address_line_2      VARCHAR(150) NULL,
  district             VARCHAR(50) NULL,
  gs_division          VARCHAR(100) NULL,
  electorate           VARCHAR(100) NULL,
  mobile_phone         VARCHAR(20) NULL,
  land_phone           VARCHAR(20) NULL,
  email                VARCHAR(150) NULL,
  guardian_name        VARCHAR(150) NULL,
  guardian_relationship VARCHAR(50) NULL,
  guardian_phone       VARCHAR(20) NULL,
  emergency_contact    VARCHAR(150) NULL,
  profile_completion_status ENUM('Not Started','In Progress','Completed') NOT NULL DEFAULT 'Not Started',
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_profile_student (student_id),
  CONSTRAINT fk_profile_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

-- 9. ROLE (created before user_account/user_role reference it)
CREATE TABLE IF NOT EXISTS role (
  role_id     INT AUTO_INCREMENT PRIMARY KEY,
  role_name   VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_role_name (role_name)
) ENGINE=InnoDB;

-- 8. USER_ACCOUNT
CREATE TABLE IF NOT EXISTS user_account (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NULL,
  username       VARCHAR(50) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  account_status ENUM('Active','Inactive','Locked') NOT NULL DEFAULT 'Active',
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at  DATETIME NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_account_student (student_id),
  UNIQUE KEY uq_user_account_username (username),
  UNIQUE KEY uq_user_account_email (email),
  CONSTRAINT fk_user_account_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

-- 10. USER_ROLE
CREATE TABLE IF NOT EXISTS user_role (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES user_account(user_id),
  CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(role_id)
) ENGINE=InnoDB;

-- 11. ACADEMIC_YEAR
CREATE TABLE IF NOT EXISTS academic_year (
  academic_year_id INT AUTO_INCREMENT PRIMARY KEY,
  academic_year    VARCHAR(20) NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  status           ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  UNIQUE KEY uq_academic_year (academic_year)
) ENGINE=InnoDB;

-- 12. SEMESTER
CREATE TABLE IF NOT EXISTS semester (
  semester_id       INT AUTO_INCREMENT PRIMARY KEY,
  academic_year_id  INT NOT NULL,
  semester_no       TINYINT NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  registration_open  DATETIME NULL,
  registration_close DATETIME NULL,
  status            ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_semester_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_year(academic_year_id)
) ENGINE=InnoDB;

-- 13. STUDENT_SEMESTER_REGISTRATION
CREATE TABLE IF NOT EXISTS student_semester_registration (
  semester_registration_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id           INT NOT NULL,
  semester_id          INT NOT NULL,
  study_year           TINYINT NOT NULL,
  study_level          VARCHAR(30) NULL,
  academic_status      VARCHAR(30) NOT NULL DEFAULT 'Continuing',
  financial_eligibility ENUM('Eligible','Not Eligible') NOT NULL DEFAULT 'Eligible',
  registration_status  ENUM('Pending','Registered','Cancelled') NOT NULL DEFAULT 'Pending',
  registered_at        DATETIME NULL,
  registered_by        INT NULL,
  UNIQUE KEY uq_ssr_student_semester (student_id, semester_id),
  CONSTRAINT fk_ssr_student  FOREIGN KEY (student_id) REFERENCES student(student_id),
  CONSTRAINT fk_ssr_semester FOREIGN KEY (semester_id) REFERENCES semester(semester_id),
  CONSTRAINT fk_ssr_registered_by FOREIGN KEY (registered_by) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

-- 14. COURSE
CREATE TABLE IF NOT EXISTS course (
  course_id   INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(150) NOT NULL,
  credits     TINYINT NOT NULL,
  status      ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  UNIQUE KEY uq_course_code (course_code)
) ENGINE=InnoDB;

-- 15. PROGRAMME_COURSE
CREATE TABLE IF NOT EXISTS programme_course (
  programme_course_id INT AUTO_INCREMENT PRIMARY KEY,
  programme_id        INT NOT NULL,
  course_id            INT NOT NULL,
  recommended_year     TINYINT NOT NULL,
  semester_no          TINYINT NOT NULL,
  course_type          ENUM('Compulsory','Elective') NOT NULL DEFAULT 'Compulsory',
  is_compulsory        BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_programme_course (programme_id, course_id, recommended_year, semester_no),
  CONSTRAINT fk_pc_programme FOREIGN KEY (programme_id) REFERENCES programme(programme_id),
  CONSTRAINT fk_pc_course    FOREIGN KEY (course_id) REFERENCES course(course_id)
) ENGINE=InnoDB;

-- 16. COURSE_REGISTRATION
CREATE TABLE IF NOT EXISTS course_registration (
  course_registration_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  semester_id  INT NOT NULL,
  status       ENUM('Draft','Submitted','Approved','Rejected') NOT NULL DEFAULT 'Draft',
  submitted_at DATETIME NULL,
  approved_at  DATETIME NULL,
  approved_by  INT NULL,
  UNIQUE KEY uq_course_registration_student_semester (student_id, semester_id),
  CONSTRAINT fk_cr_student   FOREIGN KEY (student_id) REFERENCES student(student_id),
  CONSTRAINT fk_cr_semester  FOREIGN KEY (semester_id) REFERENCES semester(semester_id),
  CONSTRAINT fk_cr_approved_by FOREIGN KEY (approved_by) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

-- 17. COURSE_REGISTRATION_ITEM
CREATE TABLE IF NOT EXISTS course_registration_item (
  registration_item_id  INT AUTO_INCREMENT PRIMARY KEY,
  course_registration_id INT NOT NULL,
  course_id              INT NOT NULL,
  selection_type         ENUM('Compulsory','Elective') NOT NULL DEFAULT 'Compulsory',
  status                 ENUM('Registered','Dropped') NOT NULL DEFAULT 'Registered',
  UNIQUE KEY uq_cri_registration_course (course_registration_id, course_id),
  CONSTRAINT fk_cri_registration FOREIGN KEY (course_registration_id) REFERENCES course_registration(course_registration_id),
  CONSTRAINT fk_cri_course       FOREIGN KEY (course_id) REFERENCES course(course_id)
) ENGINE=InnoDB;

-- 18. STUDENT_MEDIA
CREATE TABLE IF NOT EXISTS student_media (
  media_id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id         INT NOT NULL,
  media_type         ENUM('Profile Photo','Signature') NOT NULL,
  file_path          VARCHAR(500) NOT NULL,
  file_name          VARCHAR(255) NOT NULL,
  mime_type          VARCHAR(100) NOT NULL,
  verification_status ENUM('Pending','Verified','Rejected') NOT NULL DEFAULT 'Pending',
  uploaded_by        INT NOT NULL,
  uploaded_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_by        INT NULL,
  verified_at        DATETIME NULL,
  rejection_reason   VARCHAR(255) NULL,
  is_current         BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_media_student   FOREIGN KEY (student_id) REFERENCES student(student_id),
  CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES user_account(user_id),
  CONSTRAINT fk_media_verified_by FOREIGN KEY (verified_by) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

-- 19. STUDENT_DOCUMENT
CREATE TABLE IF NOT EXISTS student_document (
  document_id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id          INT NOT NULL,
  document_type       ENUM('NIC Copy','Birth Certificate','Admission Letter','Medical Certificate','School Certificate','Other') NOT NULL,
  file_path           VARCHAR(500) NOT NULL,
  file_name           VARCHAR(255) NOT NULL,
  verification_status ENUM('Pending','Verified','Rejected') NOT NULL DEFAULT 'Pending',
  uploaded_by         INT NOT NULL,
  uploaded_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_by         INT NULL,
  verified_at         DATETIME NULL,
  rejection_reason    VARCHAR(255) NULL,
  CONSTRAINT fk_document_student     FOREIGN KEY (student_id) REFERENCES student(student_id),
  CONSTRAINT fk_document_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES user_account(user_id),
  CONSTRAINT fk_document_verified_by FOREIGN KEY (verified_by) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

-- 20. IMPORT_BATCH
CREATE TABLE IF NOT EXISTS import_batch (
  import_batch_id   INT AUTO_INCREMENT PRIMARY KEY,
  file_name         VARCHAR(255) NOT NULL,
  intake_id         INT NOT NULL,
  regulation_id     INT NOT NULL,
  uploaded_by       INT NOT NULL,
  uploaded_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_records     INT NOT NULL DEFAULT 0,
  successful_records INT NOT NULL DEFAULT 0,
  failed_records    INT NOT NULL DEFAULT 0,
  status            ENUM('Processing','Completed','Failed') NOT NULL DEFAULT 'Processing',
  CONSTRAINT fk_import_batch_intake     FOREIGN KEY (intake_id) REFERENCES intake(intake_id),
  CONSTRAINT fk_import_batch_regulation FOREIGN KEY (regulation_id) REFERENCES academic_regulation(regulation_id),
  CONSTRAINT fk_import_batch_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

-- 21. IMPORT_BATCH_RECORD
CREATE TABLE IF NOT EXISTS import_batch_record (
  import_record_id  INT AUTO_INCREMENT PRIMARY KEY,
  import_batch_id   INT NOT NULL,
  row_number        INT NOT NULL,
  registration_no   VARCHAR(30) NULL,
  nic_no            VARCHAR(20) NULL,
  student_name      VARCHAR(150) NULL,
  validation_status ENUM('Valid','Warning','Error') NOT NULL,
  error_message     VARCHAR(500) NULL,
  student_id        INT NULL,
  CONSTRAINT fk_ibr_batch   FOREIGN KEY (import_batch_id) REFERENCES import_batch(import_batch_id),
  CONSTRAINT fk_ibr_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

-- 22. AUDIT_LOG
CREATE TABLE IF NOT EXISTS audit_log (
  audit_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  student_id  INT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   VARCHAR(50) NOT NULL,
  action      VARCHAR(50) NOT NULL,
  old_value   JSON NULL,
  new_value   JSON NULL,
  reason      VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address  VARCHAR(45) NULL,
  CONSTRAINT fk_audit_user    FOREIGN KEY (user_id) REFERENCES user_account(user_id),
  CONSTRAINT fk_audit_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

-- 23. NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  type     VARCHAR(50) NOT NULL,
  channel  ENUM('Email','SMS','In-App') NOT NULL DEFAULT 'Email',
  subject  VARCHAR(255) NULL,
  message  TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at  DATETIME NULL,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
