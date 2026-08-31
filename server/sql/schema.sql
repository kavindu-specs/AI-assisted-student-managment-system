-- Rajarata University Student Management System
-- Refined relational schema (v2) - transcribed from the refined EER diagram /
-- schema-mapping table, plus two additions confirmed with the product owner:
--   1. student.full_name (the diagram had no column anywhere for a student's name)
--   2. student.programme_id / intake_id / regulation_id (the diagram left the
--      whole faculty->programme->intake->regulation chain disconnected from student)
-- MySQL 8.0+. InnoDB, utf8mb4.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS rajarata_sms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rajarata_sms;

-- Reference / lookup tables ---------------------------------------------

CREATE TABLE IF NOT EXISTS role (
  role_id     INT AUTO_INCREMENT PRIMARY KEY,
  role_name   VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_role_name (role_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faculty (
  faculty_id   INT AUTO_INCREMENT PRIMARY KEY,
  faculty_name VARCHAR(150) NOT NULL,
  UNIQUE KEY uq_faculty_name (faculty_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS programme (
  programme_id   INT AUTO_INCREMENT PRIMARY KEY,
  programme_code VARCHAR(20) NOT NULL,
  programme_name VARCHAR(200) NOT NULL,
  faculty_id     INT NOT NULL,
  UNIQUE KEY uq_programme_code (programme_code),
  CONSTRAINT fk_programme_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS intake (
  intake_id   INT AUTO_INCREMENT PRIMARY KEY,
  programme_id INT NOT NULL,
  intake_code VARCHAR(20) NOT NULL,
  intake_year YEAR NOT NULL,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_intake_code (intake_code),
  CONSTRAINT fk_intake_programme FOREIGN KEY (programme_id) REFERENCES programme(programme_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS academic_regulation (
  regulation_id   INT AUTO_INCREMENT PRIMARY KEY,
  regulation_code VARCHAR(20) NOT NULL,
  regulation_name VARCHAR(200) NOT NULL,
  effective_from  DATE NOT NULL,
  UNIQUE KEY uq_regulation_code (regulation_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS academic_year (
  academic_year_id INT AUTO_INCREMENT PRIMARY KEY,
  year_code        VARCHAR(10) NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  UNIQUE KEY uq_academic_year_code (year_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semester (
  semester_id      INT AUTO_INCREMENT PRIMARY KEY,
  academic_year_id INT NOT NULL,
  semester_code    VARCHAR(10) NOT NULL,
  semester_name    VARCHAR(100) NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  UNIQUE KEY uq_semester_code (semester_code),
  CONSTRAINT fk_semester_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_year(academic_year_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course (
  course_id   INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  credits     INT NOT NULL,
  is_elective TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_course_code (course_code)
) ENGINE=InnoDB;

-- Identity: USER_ACCOUNT as the base table, ADMIN_USER/STUDENT as subtypes --

CREATE TABLE IF NOT EXISTS user_account (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  status        ENUM('Active','Inactive','Locked') NOT NULL DEFAULT 'Inactive',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login    DATETIME NULL,
  UNIQUE KEY uq_user_account_username (username),
  UNIQUE KEY uq_user_account_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_role (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES user_account(user_id),
  CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(role_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_user (
  admin_id             INT PRIMARY KEY,
  institutional_email  VARCHAR(150) NOT NULL,
  staff_no             VARCHAR(50) NULL,
  designation          VARCHAR(150) NULL,
  UNIQUE KEY uq_admin_institutional_email (institutional_email),
  UNIQUE KEY uq_admin_staff_no (staff_no),
  CONSTRAINT fk_admin_user_account FOREIGN KEY (admin_id) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student (
  student_id     INT PRIMARY KEY,
  reg_number     VARCHAR(50) NOT NULL,
  full_name      VARCHAR(150) NOT NULL,
  nic            VARCHAR(20) NOT NULL,
  programme_id   INT NOT NULL,
  intake_id      INT NOT NULL,
  regulation_id  INT NOT NULL,
  account_status ENUM('Active','Inactive','Suspended') NOT NULL DEFAULT 'Inactive',
  current_status ENUM('Prospective','Registered','Graduated','Released') NOT NULL DEFAULT 'Prospective',
  UNIQUE KEY uq_student_reg_number (reg_number),
  UNIQUE KEY uq_student_nic (nic),
  CONSTRAINT fk_student_user_account FOREIGN KEY (student_id) REFERENCES user_account(user_id),
  CONSTRAINT fk_student_programme FOREIGN KEY (programme_id) REFERENCES programme(programme_id),
  CONSTRAINT fk_student_intake FOREIGN KEY (intake_id) REFERENCES intake(intake_id),
  CONSTRAINT fk_student_regulation FOREIGN KEY (regulation_id) REFERENCES academic_regulation(regulation_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_account (
  account_id      INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  login_completed TINYINT(1) NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_account_student (student_id),
  CONSTRAINT fk_student_account_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_profile (
  profile_id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id              INT NOT NULL,
  address                 TEXT NULL,
  contact_no              VARCHAR(20) NULL,
  email                   VARCHAR(150) NULL,
  date_of_birth           DATE NULL,
  gender                  ENUM('Male','Female','Other') NULL,
  family_info             TEXT NULL,
  emergency_contact       VARCHAR(150) NULL,
  other_details           TEXT NULL,
  profile_completion_pct  DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  UNIQUE KEY uq_student_profile_student (student_id),
  CONSTRAINT fk_student_profile_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

-- Weak entities: depend entirely on student ------------------------------

CREATE TABLE IF NOT EXISTS profile_photograph (
  photo_id    INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT NOT NULL,
  file_path   VARCHAR(255) NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_photo_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS signature (
  signature_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  file_path    VARCHAR(255) NOT NULL,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_signature_student FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS supporting_document (
  document_id  INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  doc_type     VARCHAR(100) NOT NULL,
  file_path    VARCHAR(255) NOT NULL,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_verified  TINYINT(1) NOT NULL DEFAULT 0,
  verified_by  INT NULL,
  verified_at  DATETIME NULL,
  CONSTRAINT fk_document_student FOREIGN KEY (student_id) REFERENCES student(student_id),
  CONSTRAINT fk_document_verified_by FOREIGN KEY (verified_by) REFERENCES admin_user(admin_id)
) ENGINE=InnoDB;

-- Course registration -----------------------------------------------------

CREATE TABLE IF NOT EXISTS course_registration (
  registration_id  INT AUTO_INCREMENT PRIMARY KEY,
  student_id       INT NOT NULL,
  semester_id      INT NOT NULL,
  registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status           ENUM('Draft','Submitted','Approved','Rejected') NOT NULL DEFAULT 'Draft',
  UNIQUE KEY uq_course_registration_student_semester (student_id, semester_id),
  CONSTRAINT fk_registration_student FOREIGN KEY (student_id) REFERENCES student(student_id),
  CONSTRAINT fk_registration_semester FOREIGN KEY (semester_id) REFERENCES semester(semester_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_registration_item (
  item_id         INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  course_id       INT NOT NULL,
  is_compulsory   TINYINT(1) NOT NULL DEFAULT 0,
  is_elective     TINYINT(1) NOT NULL DEFAULT 0,
  selected_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_registration_item_course (registration_id, course_id),
  CONSTRAINT fk_item_registration FOREIGN KEY (registration_id) REFERENCES course_registration(registration_id),
  CONSTRAINT fk_item_course FOREIGN KEY (course_id) REFERENCES course(course_id)
) ENGINE=InnoDB;

-- Bulk import + correction workflow ---------------------------------------

CREATE TABLE IF NOT EXISTS import_batch (
  batch_id         INT AUTO_INCREMENT PRIMARY KEY,
  file_name        VARCHAR(255) NOT NULL,
  imported_by      INT NOT NULL,
  import_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_records    INT NOT NULL DEFAULT 0,
  valid_records    INT NOT NULL DEFAULT 0,
  invalid_records  INT NOT NULL DEFAULT 0,
  status           ENUM('Processing','Completed','Failed') NOT NULL DEFAULT 'Processing',
  CONSTRAINT fk_import_batch_admin FOREIGN KEY (imported_by) REFERENCES admin_user(admin_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS correction_request (
  correction_id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id      INT NOT NULL,
  requested_by  INT NOT NULL,
  requested_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  justification TEXT NULL,
  status        ENUM('Pending','Approved','Rejected','Completed') NOT NULL DEFAULT 'Pending',
  CONSTRAINT fk_correction_batch FOREIGN KEY (batch_id) REFERENCES import_batch(batch_id),
  CONSTRAINT fk_correction_admin FOREIGN KEY (requested_by) REFERENCES admin_user(admin_id)
) ENGINE=InnoDB;

-- Audit & notifications -----------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id    INT NOT NULL,
  action      VARCHAR(100) NOT NULL,
  entity_name VARCHAR(100) NOT NULL,
  entity_id   INT NOT NULL,
  description TEXT NULL,
  ip_address  VARCHAR(45) NULL,
  timestamp   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  type       ENUM('Info','Success','Warning','Error') NOT NULL DEFAULT 'Info',
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_as ENUM('System','User') NOT NULL DEFAULT 'System',
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

-- Not part of the refined EER diagram - added so admin OTP verification works
-- correctly once the API runs as multiple clustered processes (any worker can
-- validate an OTP another worker issued). One row per pending challenge,
-- overwritten on each new login attempt.
CREATE TABLE IF NOT EXISTS otp_challenge (
  user_id    INT PRIMARY KEY,
  otp_hash   VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  CONSTRAINT fk_otp_challenge_user FOREIGN KEY (user_id) REFERENCES user_account(user_id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
