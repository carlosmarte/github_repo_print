import cliProgress from "cli-progress";
import fg from "fast-glob";
import fs from "fs";
import mime from "mime-types";
import Prism from "prismjs";
import path from "path";
import { mkdirp } from "mkdirp";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prismjsBasePath = path.join(__dirname, "../node_modules/prismjs");

const getFileExtension = (v) => (v.includes(".") ? v.split(".").pop() : "");

const prismStyle = ["themes/prism.min.css", "themes/prism-coy.min.css"]
  .map((theme) => fs.readFileSync(path.join(prismjsBasePath, theme), "utf-8"))
  .join("\n");

const styles = `
body {
    font: 10pt Georgia, "Times New Roman", Times, serif;
    line-height: 1.3;
    margin: .5cm .5cm .5cm 1.5cm;
}
.pagebreak {
    margin-top: 50px;
}
.token.atrule, .token.attr-value, .token.class-name, .token.keyword {
    color: #7114A9;
    font-weight: bold;
}
.token.attr-name, .token.builtin, .token.constant {
    color: #E90;
}
`;

/**
 * Check if file content matches any of the content filters
 * @param {string} fileContent - The content of the file
 * @param {Array} contentFilters - Array of strings or RegExp to match against content
 * @returns {boolean} - True if content matches any filter, false otherwise
 */
const matchesContentFilter = (fileContent, contentFilters) => {
  if (!contentFilters || contentFilters.length === 0) {
    return true; // No content filters, so all files match
  }

  return contentFilters.some((filter) => {
    // If filter is a string, convert wildcards to RegExp
    if (typeof filter === "string") {
      // Convert glob-like wildcards to RegExp patterns
      const regexPattern = filter
        .replace(/\*\*/g, ".*") // Convert ** to .*
        .replace(/\*/g, "[^]*"); // Convert * to [^]*

      const regex = new RegExp(regexPattern, "i");
      return regex.test(fileContent);
    }
    // If filter is already a RegExp
    else if (filter instanceof RegExp) {
      return filter.test(fileContent);
    }

    return false;
  });
};

/**
 * Process a local directory and generate HTML output with syntax-highlighted source code
 * @param {string} localPath - Absolute path to the local directory to process
 * @param {string} outputPath - Path where output files will be generated
 * @param {object} options - Processing options
 * @param {string|string[]} options.match - Glob pattern(s) for files to include (default: all files)
 * @param {string[]} options.ignore - Glob patterns for files to ignore
 * @param {Array} options.content - Content filters (strings or RegExp) to match file content
 * @param {string} options.filename - Custom filename for output (default: directory name)
 * @param {boolean} options.debug - Enable debug logging
 * @returns {Promise<string[]>} - Array of matched file paths
 */
const processLocalDirectory = async (localPath, outputPath, options = {}) => {
  // Validate that localPath exists and is a directory
  if (!fs.existsSync(localPath)) {
    throw new Error(`Path does not exist: ${localPath}`);
  }

  const stats = fs.statSync(localPath);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${localPath}`);
  }

  const dirName = path.basename(localPath);
  const outputfilePath = path.join(__dirname, "..", outputPath + "_generated");

  mkdirp.sync(outputfilePath);

  const files = fg.sync(options.match || "**/*.*", {
    cwd: localPath,
    dot: false,
    ignore: options.ignore || [],
  });

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  console.log(`Processing files total files: ${files.length}`);
  progressBar.start(files.length, 0);

  let outputHtml =
    `<html><head><style>${styles}${prismStyle}</style></head><body>` +
    `<details><summary>All Files</summary>${files
      .map((file) => `<p>${file}</p>`)
      .join("\n")}</details>`;

  let matchedFiles = [];

  for (const file of files) {
    const filePath = path.join(localPath, file);
    const fileExtension = getFileExtension(file);
    const fileMime = mime.lookup(filePath) || "";

    if (options.debug) console.log(filePath);

    try {
      const content = fs.readFileSync(filePath, "utf-8");

      // Skip files that don't match content filters
      if (!matchesContentFilter(content, options.content)) {
        progressBar.increment();
        continue;
      }

      matchedFiles.push(file);

      const highlighted = Prism.highlight(
        content,
        Prism.languages[fileExtension] || Prism.languages.javascript,
        fileExtension || "javascript"
      );

      outputHtml += `<h2>${file}</h2><pre><code class="language-${fileExtension}">${highlighted}</code></pre>`;
    } catch (error) {
      if (options.debug) {
        console.error(`Error processing file ${filePath}:`, error.message);
      }
    }

    progressBar.increment();
  }

  progressBar.stop();
  outputHtml += "</body></html>";

  const outputFilename = options.filename || dirName;
  fs.writeFileSync(
    path.join(outputfilePath, `${outputFilename}.html`),
    outputHtml
  );
  fs.writeFileSync(
    path.join(outputfilePath, `${outputFilename}.json`),
    JSON.stringify(matchedFiles, null, 2)
  );

  console.log(
    `Processing complete. ${
      matchedFiles.length
    } files matched. Output saved to ${path.join(
      outputfilePath,
      outputFilename
    )}`
  );

  return matchedFiles;
};

export { processLocalDirectory };
