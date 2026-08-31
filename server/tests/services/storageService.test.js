jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  renameSync: jest.fn(),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

const path = require('path');
const fs = require('fs');
const storageService = require('../../src/services/storageService');

describe('storageService.persist', () => {
  it('creates the destination directory, moves the file into it, and returns a forward-slash relative path', async () => {
    const result = await storageService.persist('/tmp/uploads/xyz123.jpg', { studentId: 5, category: 'photo' });

    const expectedDir = path.join(process.cwd(), 'uploads', 'students', '5', 'photo');
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDir, { recursive: true });

    const expectedDest = path.join(expectedDir, 'xyz123.jpg');
    expect(fs.renameSync).toHaveBeenCalledWith('/tmp/uploads/xyz123.jpg', expectedDest);

    expect(result).toBe('uploads/students/5/photo/xyz123.jpg');
    expect(result).not.toContain('\\');
  });

  it('namespaces the destination directory by studentId and category', async () => {
    await storageService.persist('/tmp/a.pdf', { studentId: 9, category: 'documents' });
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join(process.cwd(), 'uploads', 'students', '9', 'documents'),
      { recursive: true },
    );
  });
});

describe('storageService.remove', () => {
  it('deletes the file when it exists', () => {
    fs.existsSync.mockReturnValue(true);
    storageService.remove('uploads/students/5/photo/xyz123.jpg');

    expect(fs.unlinkSync).toHaveBeenCalledWith(
      path.join(process.cwd(), 'uploads/students/5/photo/xyz123.jpg'),
    );
  });

  it('does nothing when the file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    storageService.remove('uploads/students/5/photo/gone.jpg');

    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});
