module.exports = {
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
