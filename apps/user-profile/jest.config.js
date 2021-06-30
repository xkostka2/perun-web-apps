module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/users-page',

  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',

      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  displayName: 'user-profile',

  transform: { '^.+\\.(ts|js|html)$': 'jest-preset-angular' },
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
};
