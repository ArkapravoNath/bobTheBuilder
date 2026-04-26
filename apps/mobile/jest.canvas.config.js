/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { configFile: './babel.canvas.config.js' }],
  },
  // No RN setup files — viewport math is pure TypeScript
  setupFiles: [],
  testMatch: ['<rootDir>/src/canvas/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bob/shared-schemas$':
      '<rootDir>/../../packages/shared-schemas/src/index.ts',
  },
};
