const fs = require('fs');
const path = require('path');
const env = require('../config/env');

/**
 * Local-disk storage backend. Swap this file's implementation for an
 * S3/Cloudinary client later without touching any caller.
 */
async function persist(tmpFilePath, { studentId, category }) {
  const destDir = path.join(process.cwd(), env.upload.dir, 'students', String(studentId), category);
  fs.mkdirSync(destDir, { recursive: true });

  const fileName = path.basename(tmpFilePath);
  const destPath = path.join(destDir, fileName);
  fs.renameSync(tmpFilePath, destPath);

  return path.relative(process.cwd(), destPath).split(path.sep).join('/');
}

function remove(relativePath) {
  const absolute = path.join(process.cwd(), relativePath);
  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}

module.exports = { persist, remove };
