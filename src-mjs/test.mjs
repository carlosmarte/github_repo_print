import { processRepository } from "./github_repo_print.mjs";

await processRepository(
  "https://github.com/expressjs/express.git",
  "./output",
  {
    match: ["**/lib/**.js"],
    ignore: ["**/node_modules/**"],
    filename: "express",
    debug: true,
  }
);
