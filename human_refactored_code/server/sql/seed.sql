-- Baseline reference data required before the API is usable.
USE rajarata_sms;

INSERT IGNORE INTO role (role_name, description) VALUES
  ('admin', 'University administration staff'),
  ('student', 'Registered student');
