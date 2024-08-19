import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  clearMocks: true,
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

export default config;
