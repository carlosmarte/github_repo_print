# GitHub Repository Processor

## Overview

This Rust application clones a GitHub repository, processes its files, and applies syntax highlighting to its contents using `syntect`. The output includes an HTML file with formatted code and a JSON file listing the processed files.

## Features

- **Clones GitHub repositories** with SSH or HTTPS authentication
- **Filters files** based on multiple matching patterns and ignored directories
- **Applies syntax highlighting** using `syntect`
- **Outputs HTML and JSON** formatted files
- **Displays progress** using `indicatif`

## Installation

### Prerequisites

Ensure you have Rust installed. If not, install it via:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Dependencies

This project uses several crates. Add them to `Cargo.toml`:

```toml
[dependencies]
git2 = "0.14"
glob = "0.3"
indicatif = "0.16"
syntect = "4.6"
serde_json = "1.0"
```

Alternatively, install them using Cargo:

```sh
cargo add git2 glob indicatif syntect serde_json
```

## Usage

### Running the Application

Compile and run the program:

```sh
cargo run --release
```

### Example Execution

```sh
cargo run --release -- https://github.com/expressjs/express.git
```

The application will:

1. Clone the repository
2. Process files matching patterns such as `**/*.rs`, `**/*.js`, and `**/*.py`
3. Generate an HTML file with syntax-highlighted content
4. Output a JSON file listing processed files

### Authentication Methods

- **SSH:** Requires an SSH key at `~/.ssh/id_rsa`
- **HTTPS:** Uses `GITHUB_USERNAME` and `GITHUB_TOKEN` environment variables

### Output Files

- `output_generated/<repo_name>.html` - Syntax-highlighted HTML file
- `output_generated/<repo_name>.json` - JSON file listing processed files

## Customization

Modify `ProcessOptions` for custom settings:

```rust
let options = ProcessOptions {
    debug: true,
    auth_method: AuthMethod::HTTPS,
    match_patterns: vec!["**/*.rs".to_string(), "**/*.js".to_string()],
    ..ProcessOptions::default()
};
```

## Available Themes

Run the following command to list available themes:

```sh
cargo run --release
```

## License

This project is licensed under the MIT License.
