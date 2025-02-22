use glob::glob;
use indicatif::{ProgressBar, ProgressStyle};
use std::error::Error;
use std::fs;
use std::path::{Path, PathBuf};
use syntect::highlighting::ThemeSet;
use syntect::html;
use syntect::parsing::SyntaxSet;

const STYLE: &str = r#"
body {
    font: 10pt Georgia, "Times New Roman", Times, serif;
    line-height: 1.3;
    margin: .5cm .5cm .5cm 1.5cm;
}
.pagebreak {
    margin-top: 50px;
}
"#;

#[derive(Debug)]
pub struct ProcessOptions {
    pub match_patterns: Vec<String>,
    pub ignore: Vec<String>,
    pub debug: bool,
    pub filename: Option<String>,
}

impl Default for ProcessOptions {
    fn default() -> Self {
        ProcessOptions {
            match_patterns: vec![
                "**/*.rs".to_string(),
                "**/*.js".to_string(),
                "**/*.py".to_string(),
            ],
            ignore: vec![
                ".git".to_string(),
                "node_modules".to_string(),
                ".DS_Store".to_string(),
                "__pycache__".to_string(),
                "target".to_string(),
            ],
            debug: false,
            filename: None,
        }
    }
}

pub struct DirectoryProcessor {
    syntax_set: SyntaxSet,
    theme_set: ThemeSet,
}

impl DirectoryProcessor {
    pub fn new() -> Self {
        DirectoryProcessor {
            syntax_set: SyntaxSet::load_defaults_newlines(),
            theme_set: ThemeSet::load_defaults(),
        }
    }

    pub fn process_directory(
        &self,
        input_path: &Path,
        output_path: &Path,
        options: ProcessOptions,
    ) -> Result<(), Box<dyn Error>> {
        let dir_name = input_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("directory");

        let output_file_path = output_path.join(format!("{}_generated", dir_name));
        fs::create_dir_all(&output_file_path)?;

        let files: Vec<PathBuf> = options
            .match_patterns
            .iter()
            .flat_map(|pattern| glob(input_path.join(pattern).to_str().unwrap()).unwrap())
            .filter_map(Result::ok)
            .filter(|path| {
                !options
                    .ignore
                    .iter()
                    .any(|ignore| path.to_str().map(|p| p.contains(ignore)).unwrap_or(false))
            })
            .collect();

        println!("Processing {} files...", files.len());
        let progress_bar = ProgressBar::new(files.len() as u64);
        progress_bar.set_style(
            ProgressStyle::default_bar()
                .template("[{wide_bar:.cyan/blue}] {pos}/{len} ({eta})")
                .unwrap(),
        );

        let mut output_html = format!("<html><head><style>{}</style></head><body>", STYLE);

        for file in &files {
            let content = fs::read_to_string(&file).unwrap_or_default();
            let extension = file
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("txt");
            let syntax = self
                .syntax_set
                .find_syntax_by_extension(extension)
                .unwrap_or_else(|| self.syntax_set.find_syntax_plain_text());
            let theme = &self.theme_set.themes["InspiredGitHub"];
            let highlighted =
                html::highlighted_html_for_string(&content, &self.syntax_set, syntax, theme)?;
            output_html.push_str(&format!(
                "<h2>{}</h2><pre><code class=\"language-{}\">{}",
                file.display(),
                extension,
                highlighted
            ));
            output_html.push_str("</code></pre>");
            progress_bar.inc(1);
        }

        output_html.push_str("</body></html>");
        progress_bar.finish();

        let output_filename = options.filename.unwrap_or_else(|| dir_name.to_string());
        let html_path = output_file_path.join(format!("{}.html", output_filename));
        let json_path = output_file_path.join(format!("{}.json", output_filename));

        fs::write(&html_path, output_html)?;
        fs::write(
            &json_path,
            serde_json::to_string_pretty(
                &files
                    .iter()
                    .filter_map(|p| p.strip_prefix(input_path).ok())
                    .filter_map(|p| p.to_str())
                    .collect::<Vec<&str>>(),
            )?,
        )?;

        println!(
            "Processing complete. Output saved to {}",
            output_file_path.display()
        );
        Ok(())
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let processor = DirectoryProcessor::new();
    let input_path = Path::new("input");
    let output_path = Path::new("output");
    let options = ProcessOptions {
        debug: true,
        match_patterns: vec!["**/lib/**/*.js".to_string()],
        ..ProcessOptions::default()
    };
    processor.process_directory(input_path, output_path, options)?;
    Ok(())
}
