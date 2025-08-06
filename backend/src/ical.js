import crypto from "node:crypto";

export class Course {
  constructor({ name, teacher, classroom, location, weekday, weeks, indexes }) {
    this.name = name;
    this.teacher = teacher;
    this.classroom = classroom;
    this.location = location;
    this.weekday = weekday;
    this.weeks = weeks;
    this.indexes = indexes;
  }

  title() {
    return `${this.name} - ${this.classroom}`;
  }

  description() {
    return `任课教师：${this.teacher}。`;
  }

  static week(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  static oddWeek(start, end) {
    return Course.week(start, end).filter((i) => i % 2 === 1);
  }

  static evenWeek(start, end) {
    return Course.week(start, end).filter((i) => i % 2 === 0);
  }
}

export class Geo {
  constructor(name, lat, lon) {
    this.name = name;
    this.lat = lat;
    this.lon = lon;
  }

  get geo() {
    return `GEO:${this.lat};${this.lon}`;
  }

  result() {
    return [`LOCATION:${this.name}`, this.geo];
  }
}

export class School {
  constructor({ duration = 45, timetable, start, courses }) {
    if (!timetable || !timetable.length)
      throw new Error("请设置课程时间表 timetable");
    if (!start || start.length < 3)
      throw new Error("请设置开学日期 start，如 [2023, 9, 1]");
    if (!courses || !courses.length) throw new Error("请设置课程列表 courses");

    this.duration = duration;
    this.timetable = [[0, 0], ...timetable];
    this.startDate = new Date(start[0], start[1] - 1, start[2]);
    this.startDate.setDate(
      this.startDate.getDate() - this.startDate.getDay() + 1,
    ); // 校正到周一
    this.courses = courses;

    this.HEADERS = [
      "BEGIN:VCALENDAR",
      "METHOD:PUBLISH",
      "VERSION:2.0",
      "X-WR-CALNAME:课表",
      "X-WR-TIMEZONE:Asia/Shanghai",
      "CALSCALE:GREGORIAN",
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Shanghai",
      "END:VTIMEZONE",
    ];
    this.FOOTERS = ["END:VCALENDAR"];
  }

  time(week, weekday, index, plus = false) {
    const date = new Date(this.startDate);
    date.setDate(date.getDate() + (week - 1) * 7 + (weekday - 1));
    date.setHours(this.timetable[index][0]);
    date.setMinutes(this.timetable[index][1]);
    if (plus) date.setMinutes(date.getMinutes() + this.duration);
    return date;
  }

  formatDate(dt) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
  }

  generate() {
    const runtime = new Date();
    const lines = [];

    const items = [];

    for (const course of this.courses) {
      if (!course.location) course.location = [];
      else if (typeof course.location === "string")
        course.location = [`LOCATION:${course.location}`];
      else if (course.location instanceof Geo)
        course.location = course.location.result();

      if (!Array.isArray(course.location))
        throw new Error("课程定位信息类型不正确");

      for (const week of course.weeks) {
        const dtStart = this.formatDate(
          this.time(week, course.weekday, course.indexes[0]),
        );
        const dtEnd = this.formatDate(
          this.time(week, course.weekday, course.indexes.at(-1), true),
        );
        const uidStr = `${course.title()}-${week}-${course.weekday}-${course.indexes[0]}`;
        const uid = crypto.createHash("md5").update(uidStr).digest("hex");

        const vevent = [
          "BEGIN:VEVENT",
          `SUMMARY:${course.title()}`,
          `DESCRIPTION:${course.description()}`,
          `DTSTART;TZID=Asia/Shanghai:${dtStart}`,
          `DTEND;TZID=Asia/Shanghai:${dtEnd}`,
          `DTSTAMP:${this.formatDate(runtime)}Z`,
          `UID:${uid}`,
          `URL;VALUE=URI:`,
          ...course.location,
          "END:VEVENT",
        ];
        items.push(...vevent);
      }
    }

    for (const line of [...this.HEADERS, ...items, ...this.FOOTERS]) {
      let chunk = line;
      let first = true;
      while (chunk.length > 0) {
        lines.push((first ? "" : " ") + chunk.slice(0, 72));
        chunk = chunk.slice(72);
        first = false;
      }
    }

    return lines.join("\n");
  }
}
