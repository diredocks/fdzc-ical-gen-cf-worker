import { HTMLRewriter } from "htmlrewriter";

// https://qwtel.com/posts/software/how-to-use-htmlrewriter-for-web-scraping/
async function consume(stream) {
  const reader = stream.getReader();
  while (!(await reader.read()).done) { /* NOOP */ }
}

export async function parseLoginLink(html) {
  const response = new Response(html);
  let link = "";
  
  const rewriter = new HTMLRewriter()
    .on("#frm", {
      element: (el) => link = el.getAttribute("action")
    });
  
  await consume(rewriter.transform(response).body);
  return link;
}

export async function parseBeginDate(html) {
  const response = new Response(html);
  let date = "";
  
  const datePattern = /\d{4}\/\d{1,2}\/\d{1,2}/;
  const rewriter = new HTMLRewriter()
    .on("strong", {
      text: ({ text }) => {
        if (text.trim()) {
          const match = text.match(datePattern);
          if (match) date = match[0];
        }
      }
    });
  
  await consume(rewriter.transform(response).body);
  return date;
}

export async function parseFullTable(html) {
  let leftTable = [];
  let rightTable = [];
  let leftCurrentCourse = [];
  let rightCurrentCourse = [];
  const response = new Response(html);

  const rewriter = new HTMLRewriter()
    // 左表格
    .on("body > table:nth-child(3) td tr:not([height]):not([id])", {
      element() {
        if (leftCurrentCourse.length > 0) {
          leftTable.push(leftCurrentCourse);
          leftCurrentCourse = [];
        }
      },
      text({ text }) {
        const trimmed = text.trim().replace("&nbsp;", "");
        if (trimmed) leftCurrentCourse.push(trimmed);
      },
    })
    // 右表格
    .on("td[id][align][rowspan]", {
      element(el) {
        if (rightCurrentCourse.length > 0) {
          rightTable.push(rightCurrentCourse);
          rightCurrentCourse = [];
        }
        rightCurrentCourse.push(
          parseInt(el.getAttribute("id"), 10),
          el.getAttribute("rowspan"),
        );
      },
      text({ text }) {
        const trimmed = text.trim();
        if (trimmed) rightCurrentCourse.push(trimmed);
      },
    })
  await consume(rewriter.transform(response).body);

  // 添加最后一项
  if (leftCurrentCourse.length > 0) leftTable.push(leftCurrentCourse);

  if (rightCurrentCourse.length > 0) rightTable.push(rightCurrentCourse);

  // 从左表格提取信息，弄成一个 Map
  leftTable = new Map(
    leftTable.map((v) => {
      const name = v[0].replaceAll(" ", "");
      const weeks = v
        .filter((item) => item.includes("～"))
        .flatMap((str) => {
          return str.split(",").map((range) => {
            const [start, end] = range.split("～").map(Number);
            return [start, end];
          });
        });

      return [name, { name: name, teacher: v[4], week: weeks }]; // value
    }),
  );

  // 根据条件把数组分为子数组
  const splitBy = (arr, cond) =>
    arr.reduce((res, x) => {
      if (cond(x) || res.length === 0) res.push([x]);
      else res[res.length - 1].push(x);
      return res;
    }, []);

  // 解析单元格内容
  const parseInfoToken = (token) => {
    const weekPattern = /\((.*?)\)/;
    const squareBracketsPattern = /(?<=\[)(.*?)(?=\])/g;

    if (token.includes("周")) {
      const match = weekPattern.exec(token);
      return {
        week: match[1].split(",").map((part) => {
          const [start, end] = part.replace("周", "").split("-").map(Number);
          return [start, end];
        }),
      };
    }

    if (token.includes("[")) {
      const matches = [...token.matchAll(squareBracketsPattern)];
      const result = { location: "", odd: false, even: false };
      for (const [_, content] of matches) {
        if (content === "单") result.odd = true;
        else if (content === "双") result.even = true;
        else result.location = content;
      }
      return result;
    }

    return { name: token };
  };

  rightTable = rightTable.flatMap((row) => {
    const [code, durationStr, ...rest] = row;

    // 先把数组中的元素解析成 token，然后根据名称分组，最后映射成对象
    const groupedInfo = splitBy(rest.map(parseInfoToken), (token) =>
      leftTable.has(token.name),
    ).map((v) => Object.assign({}, ...v));

    // 一个单元格可能有多堂课，
    // 查找课程名并切分出来，然后分配属性
    return groupedInfo.map((i) => ({
      index: Math.floor(code / 10),
      weekday: code % 10,
      duration: parseInt(durationStr, 10),
      ...i, // 展开课程的具体属性
    }));
  });

  const courses = rightTable.flatMap((item) => {
    // 拆分周数
    const week = item.week ?? leftTable.get(item.name)?.week;
    return week.flatMap((w) => ({
      ...item,
      week: w,
      teacher: leftTable.get(item.name)?.teacher,
    }));
  });

  // TODO: 处理补考？（大学物理）

  return courses;
}
