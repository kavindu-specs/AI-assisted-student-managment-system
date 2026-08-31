const fs = require('fs');
const path = require('path');
const env = require('../../src/config/env');

describe('uploadMiddleware', () => {
  it('exports multer instances with a .single() method for both upload kinds', () => {
    const { documentUpload, spreadsheetUpload } = require('../../src/middleware/uploadMiddleware');

    expect(typeof documentUpload.single).toBe('function');
    expect(typeof spreadsheetUpload.single).toBe('function');
  });

  it('creates the tmp upload directory as a side effect of being required', () => {
    // eslint-disable-next-line global-require
    require('../../src/middleware/uploadMiddleware');
    const tmpDir = path.join(process.cwd(), env.upload.dir, 'tmp');

    expect(fs.existsSync(tmpDir)).toBe(true);
  });
});
