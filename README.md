GitHub Repository Code Highlighter

This Rust program clones a GitHub repository, processes its source code files, and generates an HTML file with syntax-highlighted code along with a JSON file listing all processed files.

Key Features:
• Clone repositories using SSH or HTTPS authentication.
• Filter files based on multiple glob patterns (e.g., **/\*.rs, **/_.js, \*\*/_.py).
• Ignore specific directories such as .git, node_modules, and target.
• Apply syntax highlighting using syntect and generate formatted HTML output.
• Track progress using a command-line progress bar.
• Save structured output in JSON format.

Use Case:

This tool is useful for developers and code reviewers who want to create a readable, formatted HTML version of a GitHub repository’s source code for documentation or analysis.

NODE:
src-mjs/run.nodejs.md

RUST
src-rust/run.rust.md
