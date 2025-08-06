import { readFile } from 'node:fs/promises';
import { join } from 'path';
import { recognizeCaptcha } from '../src/captcha.js';

test('recognizeCaptcha with sample image', async () => {
  const captchaBuffer = await readFile(join(new URL('.', import.meta.url).pathname, '../fixtures/captcha.bmp'));
  const result = recognizeCaptcha(captchaBuffer);
  assertEqual(result, 'pch0', 'Should correctly recognize captcha');
});
