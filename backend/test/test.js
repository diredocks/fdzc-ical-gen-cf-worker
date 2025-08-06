#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { join } from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

class SimpleTestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running tests...\n');

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`PASS ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`FAIL ${name}`);
        console.log(`   ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\nResults: ${this.passed} passed, ${this.failed} failed`);
    process.exit(this.failed > 0 ? 1 : 0);
  }

  assert(condition, message = 'Assertion failed') {
    if (!condition) throw new Error(message);
  }

  async assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  async assertArrayEqual(actual, expected, message) {
    if (actual.length !== expected.length ||
      !actual.every((val, i) => val === expected[i])) {
      throw new Error(message || `Arrays not equal: ${JSON.stringify(actual)} vs ${JSON.stringify(expected)}`);
    }
  }
}

const test = new SimpleTestRunner();

// Load all test files
async function loadTests() {
  const testFiles = await readdir(join(__dirname), { recursive: true });
  const jsFiles = testFiles.filter(f => f.endsWith('.test.js'));

  for (const file of jsFiles) {
    const filePath = join(__dirname, file);
    await import(filePath);
  }
}

// Export for test files
global.test = test.test.bind(test);
global.assert = test.assert.bind(test);
global.assertEqual = test.assertEqual.bind(test);
global.assertArrayEqual = test.assertArrayEqual.bind(test);

// Run tests
await loadTests();
await test.run();
