const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const tmpDir = path.join(process.cwd(), env.upload.dir, 'tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function mimeFilter(allowed, rejectionMessage) {
  return (req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', rejectionMessage));
    }
    return cb(null, true);
  };
}

const DOCUMENT_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const SPREADSHEET_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
  'application/csv',
]);

// Student documents/media (NIC copy, certificates, photo, signature)
const documentUpload = multer({
  storage,
  fileFilter: mimeFilter(DOCUMENT_MIME_TYPES, 'Only JPG, PNG, or PDF files are allowed'),
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024 },
});

// Admin bulk-import spreadsheets
const spreadsheetUpload = multer({
  storage,
  fileFilter: mimeFilter(SPREADSHEET_MIME_TYPES, 'Only XLSX, XLS, or CSV files are allowed'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { documentUpload, spreadsheetUpload };
