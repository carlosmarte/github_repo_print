import simpleGit from "simple-git";
import { rimrafSync } from "rimraf";
import fg from "fast-glob";
import fs from "fs";
import path from "path";
import { mkdirp } from "mkdirp";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFileExtension = (v) => (v.includes(".") ? v.split(".").pop() : "");

const processRepository = async (repoUrl, outputPath, options = {}) => {
  const git = simpleGit();
  const repoName = path.basename(repoUrl, ".git");
  const clonePath = path.join(__dirname, "..", outputPath, repoName);

  // Clean up and create directories
  rimrafSync(clonePath);
  mkdirp.sync(outputPath);

  // Clone the repository
  await git.clone(repoUrl, clonePath);

  // Get all matching files
  const files = fg.sync(options.match || "**/*.*", {
    cwd: clonePath,
    dot: false,
    ignore: options.ignore || [],
  });

  console.log(`Processing files total files: ${files.length}`);

  // Process each file and create array of file objects
  const processedFiles = files
    .map((file) => {
      const filePath = path.join(clonePath, file);
      const fileExtension = getFileExtension(file);

      if (options.debug) console.log(filePath);

      try {
        const content = fs.readFileSync(filePath, "utf-8");

        return {
          path: file,
          extension: fileExtension,
          content: content,
        };
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        return null;
      }
    })
    .filter(Boolean); // Remove any null entries from failed processing

  // Clean up cloned repository
  rimrafSync(clonePath);

  return processedFiles;
};

export { processRepository };
