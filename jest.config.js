module.exports = {
  coverageDirectory: './coverage/',
  collectCoverageFrom: ['src/**/*.ts'],
  collectCoverage: true,
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      diagnostics: true,
    },
  },
  preset: 'ts-jest',
};
