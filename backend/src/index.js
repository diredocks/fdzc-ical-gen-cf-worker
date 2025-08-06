import { Hono } from 'hono'
import { recognizeCaptcha } from "./captcha.js";
import { baseURL, timetable } from "./const.js";
import { HttpClient } from "./http.js";
import { Course, School } from "./ical.js";
import { parseLoginLink, parseFullTable, parseBeginDate } from "./parse.js";

const app = new Hono();

app.get('/ics', async (c) => {
  try {
    const username = c.req.query('username');
    const password = c.req.query('password');
    const semester = c.req.query('semester');
    const year = c.req.query('year');

    if (!username || !password || !semester || !year) {
      return c.json({
        error: 'Missing required parameters: username, password, semester, year'
      }, 400);
    }

    if (semester !== '上' && semester !== '下') {
      return c.json({
        error: 'Invalid semester parameter. Use "上" for spring or "下" for fall'
      }, 400);
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 2015 || yearNum > 2030) {
      return c.json({
        error: 'Invalid year parameter. Use year format like 2025'
      }, 400);
    }

    const icsData = await generateICS(username, password, semester, year);

    return new Response(icsData, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="timetable-${username}-${year}-${semester}.ics"`
      }
    });

  } catch (error) {
    console.error('Error generating ICS:', error);
    return c.json({
      error: `Error generating calendar: ${error.message}`
    }, 500);
  }
});

async function generateICS(username, password, semester, year) {
  const client = new HttpClient(baseURL);

  try {
    let res = await client.get("default.asp");
    let loginURL = await parseLoginLink(await res.text());

    res = await client.get("ValidateCookie.asp");
    let captcha = recognizeCaptcha(await res.bytes());

    res = await client.get(`ajax/chkCode.asp?code=${captcha}&id=${Math.random()}`);
    const chkCodeResponse = await res.text();
    if (chkCodeResponse.trim() !== "ok") {
      throw new Error("验证码识别失败，请重试");
    }

    res = await client.post(loginURL, {
      "muser": username,
      "passwd": password,
      "code": captcha
    });
    client.setCookie("muser", username);

    res = await client.post("kb/kb_xs.asp", {
      "xn": year,
      "xq": semester
    });

    const full_course = await res.text();
    if (full_course.includes("出错提示")) {
      throw new Error("用户名或密码错误");
    }

    const courses = (await parseFullTable(full_course)).map((c) => {
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

    res = await client.get(`kb/zkb_xs.asp?week1=1&kkxq=${year}${semester}`);
    const beginDate = await parseBeginDate(await res.text());

    const school = new School({
      start: beginDate,
      timetable,
      courses,
    });

    return school.generate();

  } catch (error) {
    throw new Error(`Failed to fetch timetable: ${error.message}`);
  }
};

export default app;
