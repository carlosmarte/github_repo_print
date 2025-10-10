import { processLocalDirectory } from "./local-source-to-print.mjs";

/**
 * Example usage of processLocalDirectory
 *
 * This demonstrates how to process a local directory and generate
 * HTML output with syntax-highlighted source code
 */

// Example 1: Basic usage - process all files in a directory
const example1 = async () => {
  const localPath = "/Users/Shared/autoload/github_repo_print/src-mjs";
  const outputPath = "output";

  const matchedFiles = await processLocalDirectory(localPath, outputPath);
  console.log(`Processed ${matchedFiles.length} files`);
};

// Example 2: With custom file patterns
const example2 = async () => {
  const localPath = "/Users/Shared/autoload/github_repo_print";
  const outputPath = "output";

  const options = {
    match: "**/*.{js,mjs,json}", // Only process JS and JSON files
    ignore: ["**/node_modules/**", "**/.git/**"], // Ignore node_modules and .git
    filename: "my-custom-output", // Custom output filename
  };

  const matchedFiles = await processLocalDirectory(localPath, outputPath, options);
  console.log(`Processed ${matchedFiles.length} files`);
};

// Example 3: With content filtering
const example3 = async () => {
  const localPath = "/Users/Shared/autoload/github_repo_print";
  const outputPath = "output";

  const options = {
    match: "**/*.mjs",
    content: ["processRepository", "import.*prismjs"], // Only files containing these patterns
    debug: true, // Enable debug logging
  };

  const matchedFiles = await processLocalDirectory(localPath, outputPath, options);
  console.log(`Processed ${matchedFiles.length} files with matching content`);
};

// Example 4: Process a different directory with specific patterns
const example4 = async () => {
  const localPath = "/path/to/your/project";
  const outputPath = "output";

  const options = {
    match: ["src/**/*.ts", "lib/**/*.tsx"], // Multiple patterns
    ignore: ["**/*.test.ts", "**/*.spec.ts"], // Ignore test files
    filename: "typescript-source",
  };

  const matchedFiles = await processLocalDirectory(localPath, outputPath, options);
  console.log(`Processed ${matchedFiles.length} TypeScript files`);
};

// Uncomment the example you want to run:
// example1();
// example2();
// example3();
// example4();
