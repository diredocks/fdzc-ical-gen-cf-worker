import { readFile } from 'node:fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseFullTable, parseLoginLink, parseBeginDate } from '../src/parse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('parseLoginLink extracts form action', async () => {
  const html = `
    <html>
      <body>
        <form id="frm" action="/login/submit">
          <input type="text" name="username">
        </form>
      </body>
    </html>
  `;

  const link = await parseLoginLink(html);
  assertEqual(link, '/login/submit', 'Should extract form action attribute');
});

test('parseDeginDate extracts date from strong tag', async () => {
  const html = `
    <html>
      <body>
        <strong>学期开始日期: 2025/9/8</strong>
      </body>
    </html>
  `;

  const date = await parseBeginDate(html);
  assertEqual(date, '2025/9/8', 'Should extract date from strong tag');
});

test('parseDeginDate handles multiple strong tags', async () => {
  const html = `
    <html>
      <body>
        <strong>Some text</strong>
        <strong>2025/10/15</strong>
      </body>
    </html>
  `;

  const date = await parseBeginDate(html);
  assertEqual(date, '2025/10/15', 'Should find date in any strong tag');
});

test('parseFullTable with sample data', async () => {
  const html = await readFile(join(__dirname, '../fixtures/now.html'), 'utf-8');

  const courses = await parseFullTable(html);

  assert(Array.isArray(courses), 'Should return an array');
  assert(courses.length > 0, 'Should parse at least one course');

  const course = courses[0];
  assert(typeof course.name === 'string', 'Course should have name');
  assert(typeof course.teacher === 'string', 'Course should have teacher');
  assert(typeof course.location === 'string', 'Course should have location');
  assert(typeof course.weekday === 'number', 'Course should have weekday');
  assert(Array.isArray(course.week), 'Course should have week array');
  assert(typeof course.index === 'number', 'Course should have index');
  assert(typeof course.duration === 'number', 'Course should have duration');
});

test('parseFullTable handles week patterns correctly', async () => {
  const html = await readFile(join(__dirname, '../fixtures/now.html'), 'utf-8');

  const courses = await parseFullTable(html);

  for (const course of courses) {
    if (course.week) {
      assert(Array.isArray(course.week), 'Week should be array');
      assert(course.week.length === 2, 'Week range should have 2 elements');
      assert(typeof course.week[0] === 'number', 'Week start should be number');
      assert(typeof course.week[1] === 'number', 'Week end should be number');
    }
  }
});

test('parseFullTable handles odd/even flags', async () => {
  const html = await readFile(join(__dirname, '../fixtures/now.html'), 'utf-8');

  const courses = await parseFullTable(html);

  for (const course of courses) {
    if (course.odd !== undefined) {
      assert(typeof course.odd === 'boolean', 'Odd flag should be boolean');
    }
    if (course.even !== undefined) {
      assert(typeof course.even === 'boolean', 'Even flag should be boolean');
    }
  }
});
