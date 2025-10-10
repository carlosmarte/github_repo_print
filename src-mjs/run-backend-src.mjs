import { processLocalDirectory } from "./local-source-to-print.mjs";

const localPath = "/Users/Shared/thinkeloquent/Untitled/manual/flat-data-properties/v100/backend/src";
const outputPath = "output";

const options = {
  match: "**/*.{ts,js,jsx,tsx}",
  ignore: ["**/node_modules/**", "**/.git/**"],
  filename: "backend-src",
};

try {
  const matchedFiles = await processLocalDirectory(localPath, outputPath, options);
  console.log(`\nSuccessfully processed ${matchedFiles.length} files`);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
