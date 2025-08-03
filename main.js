import { readFile } from "node:fs/promises";
import parse_html from "./parse.js";

const html = await readFile("./courses.html", "utf-8");
const courses = await parse_html(html);

console.log(courses);
