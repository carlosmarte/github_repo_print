// import { processRepository } from "./github_repo_print.mjs";
import { processRepository } from "./source-to-print.mjs";
// await processRepository(
//   "https://github.com/expressjs/express.git",
//   "./output",
//   {
//     match: ["**/lib/**.js"],
//     ignore: ["**/node_modules/**"],
//     filename: "express",
//     debug: true,
//   }
// );

const files = await processRepository(
  "https://github.com/expressjs/express.git",
  "output",
  {
    match: "**/lib/**.js", // optional: match pattern
    ignore: ["node_modules/**"], // optional: ignore patterns
    debug: false, // optional: enable debug logging
    content: ["app.disabled"],
  }
);

console.log(files);
