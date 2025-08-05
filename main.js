import { readFile } from "node:fs/promises";
import { Course, School } from "./ical.js";
import { parseFullTable, parseLoginLink } from "./parse.js";
import { recognizeCaptcha } from "./captcha.js";
import { timetable } from "./const.js";

const html = await readFile("./now.html", "utf-8");

const courses = (await parseFullTable(html)).map((c) => {
  const weeks = c.odd
    ? Course.oddWeek(...c.week)
    : c.even
      ? Course.evenWeek(...c.week)
      : Course.week(...c.week);
  return new Course({
    name: c.name,
    teacher: c.teacher,
    classroom: c.location,
    weekday: c.weekday,
    weeks,
    indexes: [c.index, c.index + c.duration - 1],
  });
});

const school = new School({
  start: [2025, 9, 8], // TODO: auto retrieve
  timetable,
  courses,
});

const icsText = school.generate();
console.log(icsText);

const html1 = await readFile("./index.html", "utf-8");
console.log(await parseLoginLink(html1));

const img = await readFile("./captcha.bmp");
console.log(recognizeCaptcha(img));
